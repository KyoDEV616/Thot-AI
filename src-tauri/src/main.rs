// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{Manager, State};

struct BackendProcess(Mutex<Option<Child>>);

fn find_free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .expect("Failed to bind to port")
        .local_addr()
        .expect("Failed to get local addr")
        .port()
}

fn start_backend(port: u16) -> Child {
    if cfg!(debug_assertions) {
        // Dev mode: launch from .venv
        let manifest_dir = env!("CARGO_MANIFEST_DIR");
        let backend_dir = std::path::PathBuf::from(manifest_dir)
            .parent()
            .unwrap()
            .join("backend");

        let python = backend_dir.join(".venv").join(if cfg!(target_os = "windows") {
            "Scripts/python.exe"
        } else {
            "bin/python"
        });

        Command::new(python)
            .arg("-m")
            .arg("uvicorn")
            .arg("main:app")
            .arg("--host")
            .arg("127.0.0.1")
            .arg("--port")
            .arg(port.to_string())
            .current_dir(&backend_dir)
            .env("THOT_PORT", port.to_string())
            .spawn()
            .expect("Failed to start Python backend")
    } else {
        // Release mode: launch PyInstaller sidecar
        let sidecar = std::env::current_exe()
            .expect("Failed to get exe path")
            .parent()
            .expect("Failed to get exe dir")
            .join(if cfg!(target_os = "windows") {
                "thot-backend.exe"
            } else {
                "thot-backend"
            });

        Command::new(sidecar)
            .env("THOT_PORT", port.to_string())
            .spawn()
            .expect("Failed to start backend sidecar")
    }
}

#[tauri::command]
fn get_backend_port(state: State<'_, Mutex<u16>>) -> u16 {
    *state.lock().unwrap()
}

#[tauri::command]
fn minimize_window(window: tauri::WebviewWindow) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::WebviewWindow) {
    match window.is_maximized() {
        Ok(true) => { let _ = window.unmaximize(); }
        _ =>        { let _ = window.maximize(); }
    }
}

#[tauri::command]
fn close_window(window: tauri::WebviewWindow) {
    let _ = window.close();
}

fn main() {
    let port = find_free_port();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(port))
        .manage(BackendProcess(Mutex::new(None)))
        .setup(move |app| {
            let child = start_backend(port);
            // Give the Python backend time to initialize
            std::thread::sleep(std::time::Duration::from_secs(2));
            let state: State<BackendProcess> = app.state();
            *state.0.lock().unwrap() = Some(child);
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let child = {
                    let state: State<BackendProcess> = window.state();
                    let c = state.0.lock().unwrap().take(); // MutexGuard dropped at end of this statement
                    c
                }; // state dropped here, after MutexGuard is already gone
                if let Some(mut child) = child {
                    let _ = child.kill();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_backend_port,
            minimize_window,
            toggle_maximize_window,
            close_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
