@echo off
chcp 65001 > nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0codex-model.ps1" kimi
echo.
echo 已切换到 Kimi K3（k3-256k，1M 上下文之外用 k3-256k，更省额度）。
echo 请完全退出 Codex 桌面端（托盘图标也要退出）后重新打开，配置才会生效。
echo.
pause
