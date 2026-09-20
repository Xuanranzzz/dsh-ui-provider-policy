@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>nul
title dsh-ui-provider-policy one-click install

set "PACKAGE=dsh-ui-provider-policy"
set "REPO=github:Xuanranzzz/dsh-ui-provider-policy"
if not defined DSH_PROFILE set "DSH_PROFILE=web"
if defined DSH_HOME (set "HOME_DIR=%DSH_HOME%") else (set "HOME_DIR=%USERPROFILE%\.dsh")

set "PLUGIN_DIR=%~dp0"
if "%PLUGIN_DIR:~-1%"=="\" set "PLUGIN_DIR=%PLUGIN_DIR:~0,-1%"

echo.
echo ============================================================
echo   dsh-ui-provider-policy  --  DeepSeek Harness 插件一键安装
echo ============================================================
echo   目标 profile : %DSH_PROFILE%   (DSH_HOME = %HOME_DIR%)
echo   插件目录     : %PLUGIN_DIR%
echo.

rem ---- 1. 运行环境自检 ----------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [X] 未找到 Node.js。请先安装 Node.js 18 或更高版本后重试。
  echo     下载地址: https://nodejs.org/
  goto :fail
)
for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo [OK] Node.js !NODE_VERSION!

set "DSH=dsh"
where dsh >nul 2>nul
if errorlevel 1 (
  where npx >nul 2>nul
  if errorlevel 1 (
    echo [X] PATH 中既没有 dsh 也没有 npx,请先安装 Node.js/npm 后重试。
    goto :fail
  )
  set "DSH=npx -y @deepseek-ai/dsh"
  echo [..] PATH 中没有 dsh,改用 npx 临时调用 @deepseek-ai/dsh
) else (
  echo [OK] 已找到 dsh 命令
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [..] 未找到 pnpm,尝试用 Node 自带的 corepack 启用...
  call corepack enable pnpm >nul 2>nul
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo [..] corepack 未生效,改用 npm 全局安装 pnpm...
    call npm install -g pnpm
    where pnpm >nul 2>nul
    if errorlevel 1 (
      echo [X] pnpm 仍不可用,请手动执行 ^"npm install -g pnpm^" 后重试。
      goto :fail
    )
  )
)
echo [OK] pnpm 可用
echo.

rem ---- 2. 选择安装源 ------------------------------------------
echo 请选择安装源:
echo   [1] 本地当前目录   link:%PLUGIN_DIR%
echo   [2] GitHub 仓库    %REPO%
echo   [3] 手动输入插件目录
echo.
set "CHOICE="
set /p "CHOICE=输入 1 / 2 / 3 后回车(直接回车 = 1): "
if "!CHOICE!"=="" set "CHOICE=1"

if "!CHOICE!"=="1" (
  set "CHECK_DIR=%PLUGIN_DIR%"
  set "SPEC=link:!PLUGIN_DIR:\=/!"
  goto :have_spec
)
if "!CHOICE!"=="2" (
  set "SPEC=%REPO%"
  goto :have_spec
)
if "!CHOICE!"=="3" goto :manual
echo [X] 无效的选择: !CHOICE!
goto :fail

rem 手输目录必须走顶层语句: 在 if(...) 块里剥离引号会被 cmd 的解析规则吃掉。
:manual
set "RAW="
set /p "RAW=请输入插件目录的完整路径: "
if "!RAW!"=="" (
  echo [X] 没有读到路径。若你是用管道/重定向喂输入,cmd 的 set /p 会吞掉后续行;
  echo     请直接双击 install.cmd 后在窗口里粘贴路径。
  goto :fail
)
set "MANUAL=%RAW%"
set "MANUAL=%MANUAL:"=%"
if "%MANUAL%"=="" (
  echo [X] 没有输入路径。
  goto :fail
)
if not exist "%MANUAL%\package.json" (
  echo [X] "%MANUAL%" 下没有 package.json,不是插件目录。
  goto :fail
)
set "CHECK_DIR=%MANUAL%"
set "SPEC=link:%MANUAL:\=/%"
goto :have_spec

:have_spec
if defined CHECK_DIR (
  node -e "const p=require(process.argv[1]);process.exit(p.name==='%PACKAGE%'?0:1)" "!CHECK_DIR!\package.json" >nul 2>nul
  if errorlevel 1 (
    echo [X] "!CHECK_DIR!" 不是 %PACKAGE% 插件目录^(package.json 的 name 不匹配^)。
    goto :fail
  )
  echo [OK] 插件目录校验通过
)

set "SPEC_NOSPACE=!SPEC: =!"
if not "!SPEC!"=="!SPEC_NOSPACE!" (
  echo.
  echo [!] 警告: 安装路径中含空格。dsh 转发给 pnpm 的参数不保留引号,
  echo     含空格的路径很可能安装失败。建议改用 [2] GitHub 仓库,
  echo     或把插件目录移到不含空格的路径^(例如 %HOME_DIR%\plugins\^)。
  echo.
  set "GO="
  set /p "GO=仍要继续吗? (Y/N,默认 N): "
  if /i not "!GO!"=="Y" goto :fail
)

rem 传给外部批处理(dsh.cmd / npx.cmd)的参数必须用普通变量展开:
rem cmd 在调用批处理时不会对被调用方重新解析的 %* 做延迟展开。
set "SPEC_ARG=!SPEC!"
echo.
echo [*] 正在安装: %DSH% plugin --profile %DSH_PROFILE% add "%SPEC_ARG%"
echo.
rem call 不可省略: dsh / npx 都是 .cmd 批处理外壳,直接调用会接管并终止本脚本。
call %DSH% plugin --profile %DSH_PROFILE% add "%SPEC_ARG%"
if errorlevel 1 (
  echo.
  echo [X] 安装失败,以上是 pnpm / dsh 的原始输出。
  goto :fail
)

rem ---- 3. 结果校验 --------------------------------------------
findstr /c:"%PACKAGE%" "%HOME_DIR%\profiles\%DSH_PROFILE%\package.json" >nul 2>nul
if errorlevel 1 (
  echo.
  echo [!] 命令返回成功,但在 %HOME_DIR%\profiles\%DSH_PROFILE%\package.json
  echo     中没有找到 %PACKAGE%,请检查上面的输出。
  goto :fail
)

echo.
echo ============================================================
echo   [OK] 安装完成,插件已写入 profile "%DSH_PROFILE%"
echo ============================================================
echo   请手动重启 dsh 使其生效:
echo     1) 关闭当前运行的 dsh^(Ctrl+C 或直接关窗口^)
echo     2) 重新运行: dsh web
echo   然后打开 http://127.0.0.1:3080 -^> 设置 -^> 供应商策略
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1
