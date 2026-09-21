# dsh-ui-provider-policy 一键安装脚本 (Windows PowerShell 5.1+)
# 由 install.cmd 调用;请双击 install.cmd,不要直接运行本文件。

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { [Console]::InputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$PACKAGE = 'dsh-ui-provider-policy'
$REPO = 'github:Xuanranzzz/dsh-ui-provider-policy'
if ($env:DSH_PROFILE) { $PROFILE = $env:DSH_PROFILE } else { $PROFILE = 'web' }
if ($env:DSH_HOME) { $HOME_DIR = $env:DSH_HOME } else { $HOME_DIR = Join-Path $env:USERPROFILE '.dsh' }
$PLUGIN_DIR = $PSScriptRoot

function Fail([string]$Message) {
    Write-Host ''
    Write-Host ('[X] ' + $Message)
    Write-Host ''
    Read-Host '按回车键退出'
    exit 1
}

Write-Host ''
Write-Host ('=' * 60)
Write-Host '  dsh-ui-provider-policy -- DeepSeek Harness 插件一键安装'
Write-Host ('=' * 60)
Write-Host ('  目标 profile : ' + $PROFILE + '   (DSH_HOME = ' + $HOME_DIR + ')')
Write-Host ('  插件目录     : ' + $PLUGIN_DIR)
Write-Host ''

# ---- 1. 运行环境自检 --------------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail '未找到 Node.js。请先安装 Node.js 18 或更高版本后重试。下载: https://nodejs.org/'
}
Write-Host ('[OK] Node.js ' + (& node --version))

$dshExe = 'dsh'
$dshArgs = @()
if (Get-Command dsh -ErrorAction SilentlyContinue) {
    Write-Host '[OK] 已找到 dsh 命令'
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    $dshExe = 'npx'
    $dshArgs = @('-y', '@deepseek-ai/dsh')
    Write-Host '[..] PATH 中没有 dsh,改用 npx 临时调用 @deepseek-ai/dsh'
} else {
    Fail 'PATH 中既没有 dsh 也没有 npx,请先安装 Node.js/npm 后重试。'
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host '[..] 未找到 pnpm,尝试用 Node 自带的 corepack 启用...'
    try { & corepack enable pnpm *> $null } catch {}
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host '[..] corepack 未生效,改用 npm 全局安装 pnpm...'
        try { & npm install -g pnpm *> $null } catch {}
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Fail 'pnpm 仍不可用,请手动执行 "npm install -g pnpm" 后重试。'
        }
    }
}
Write-Host '[OK] pnpm 可用'
Write-Host ''

# ---- 2. 选择安装源 ----------------------------------------------------------
Write-Host '请选择安装源:'
Write-Host ('  [1] 本地当前目录   link:' + $PLUGIN_DIR)
Write-Host ('  [2] GitHub 仓库    ' + $REPO)
Write-Host '  [3] 手动输入插件目录'
Write-Host ''
$choice = Read-Host '输入 1 / 2 / 3 后回车(直接回车 = 1)'
if ($null -eq $choice) { $choice = '' }
$choice = $choice.Trim()
if ($choice -eq '') { $choice = '1' }

$SPEC = ''
$CHECK_DIR = $null
switch ($choice) {
    '1' {
        $CHECK_DIR = $PLUGIN_DIR
        $SPEC = 'link:' + ($PLUGIN_DIR -replace '\\', '/')
    }
    '2' {
        $SPEC = $REPO
    }
    '3' {
        $manual = Read-Host '请输入插件目录的完整路径'
        if ($null -eq $manual) { $manual = '' }
        $manual = $manual.Trim().Trim('"')
        if ($manual -eq '') { Fail '没有输入路径。' }
        if (-not (Test-Path (Join-Path $manual 'package.json'))) {
            Fail ('"' + $manual + '" 下没有 package.json,不是插件目录。')
        }
        $CHECK_DIR = $manual
        $SPEC = 'link:' + ($manual -replace '\\', '/')
    }
    default {
        Fail ('无效的选择: ' + $choice)
    }
}

if ($null -ne $CHECK_DIR) {
    try {
        $pkg = Get-Content -Raw -Encoding UTF8 (Join-Path $CHECK_DIR 'package.json') | ConvertFrom-Json
        if ($pkg.name -ne $PACKAGE) {
            Fail ('"' + $CHECK_DIR + '" 不是 ' + $PACKAGE + ' 插件目录(package.json 的 name 不匹配)。')
        }
    } catch {
        Fail ('无法读取 "' + $CHECK_DIR + '\package.json",不是插件目录。')
    }
    Write-Host '[OK] 插件目录校验通过'
}

if ($SPEC -match ' ') {
    Write-Host ''
    Write-Host '[!] 警告: 安装路径中含空格。dsh 转发给 pnpm 的参数不保留引号,'
    Write-Host '    含空格的路径很可能安装失败。建议改用 [2] GitHub 仓库,'
    Write-Host ('    或把插件目录移到不含空格的路径(例如 ' + $HOME_DIR + '\plugins\)。')
    Write-Host ''
    $go = Read-Host '仍要继续吗? (Y/N,默认 N)'
    if ($null -eq $go) { $go = '' }
    if ($go.Trim().ToUpper() -ne 'Y') { Fail '已取消。' }
}

Write-Host ''
Write-Host ('[*] 正在安装: ' + $dshExe + ' ' + ($dshArgs -join ' ') + ' plugin --profile ' + $PROFILE + ' add "' + $SPEC + '"')
Write-Host ''
& $dshExe @dshArgs plugin --profile $PROFILE add $SPEC
if ($LASTEXITCODE -ne 0) {
    Fail '安装失败,以上是 pnpm / dsh 的原始输出。'
}

# ---- 3. 结果校验 ------------------------------------------------------------
$manifest = Join-Path $HOME_DIR (Join-Path 'profiles' (Join-Path $PROFILE 'package.json'))
$depOk = $false
$bundleOk = $false
try {
    $mp = Get-Content -Raw -Encoding UTF8 $manifest | ConvertFrom-Json
    $depNames = @($mp.dependencies.PSObject.Properties).Name
    $depOk = $depNames -contains $PACKAGE
    $bundleOk = @($mp.dsh.profile.bundles) -contains $PACKAGE
} catch {
    $depOk = $false
    $bundleOk = $false
}
if (-not ($depOk -and $bundleOk)) {
    Write-Host ('[!] 命令返回成功,但 ' + $manifest + ' 里没有找到 ' + $PACKAGE + '(dependencies / bundles),请检查上面的输出。')
    Read-Host '按回车键退出'
    exit 1
}

Write-Host ''
Write-Host ('=' * 60)
Write-Host ('  [OK] 安装完成,插件已写入 profile "' + $PROFILE + '"')
Write-Host ('=' * 60)
Write-Host '  请手动重启 dsh 使其生效:'
Write-Host '    1) 关闭当前运行的 dsh(Ctrl+C 或直接关窗口)'
Write-Host '    2) 重新运行: dsh web'
Write-Host '  然后打开 http://127.0.0.1:3080 -> 设置 -> 供应商策略'
Write-Host ''
Read-Host '按回车键退出'
exit 0
