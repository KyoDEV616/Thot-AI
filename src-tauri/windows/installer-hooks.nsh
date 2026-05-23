; Thot AI — NSIS installer hooks
; Installs Ollama silently if not already present on the system.

!macro customInstall
  ; Bundle OllamaSetup.exe (placed here by CI before tauri-action runs)
  File "${__FILEDIR__}\OllamaSetup.exe"

  ; Check if ollama is already in PATH
  nsExec::ExecToStack '"$WINDIR\System32\where.exe" ollama'
  Pop $0
  ${If} $0 != 0
    DetailPrint "Ollama no encontrado. Instalando..."

    ; Try /SILENT first (Inno Setup convention used by recent Ollama versions)
    nsExec::ExecToStack '"$INSTDIR\OllamaSetup.exe" /SILENT /NORESTART'
    Pop $1
    ${If} $1 != 0
      ; Fallback: /S (older NSIS convention)
      nsExec::ExecToStack '"$INSTDIR\OllamaSetup.exe" /S'
      Pop $2
      ${If} $2 != 0
        ; Both silent modes failed — inform the user without blocking installation
        MessageBox MB_OK|MB_ICONINFORMATION \
          "Ollama no pudo instalarse automáticamente.$\n$\nPor favor instalalo manualmente desde:$\nhttps://ollama.com/download$\n$\nThot AI funcionará apenas Ollama esté corriendo."
      ${EndIf}
    ${EndIf}
  ${Else}
    DetailPrint "Ollama ya está instalado. Omitiendo."
  ${EndIf}

  ; Remove installer binary — no longer needed
  Delete "$INSTDIR\OllamaSetup.exe"
!macroend

!macro customUnInstall
  ; Intentionally empty — removing Ollama on uninstall would be destructive
  ; since the user may use Ollama with other tools.
!macroend
