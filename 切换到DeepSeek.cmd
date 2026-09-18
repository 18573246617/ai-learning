@echo off
chcp 65001 > nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0codex-model.ps1" deepseek
echo.
echo 已切换回 DeepSeek（deepseek-v4-flash）。
echo 请完全退出 Codex 桌面端（托盘图标也要退出）后重新打开，配置才会生效。
echo.
pause
