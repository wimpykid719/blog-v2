# git
autoload -Uz vcs_info
setopt prompt_subst
zstyle ':vcs_info:git:*' check-for-changes true
zstyle ':vcs_info:git:*' stagedstr "%F{180}"
zstyle ':vcs_info:git:*' unstagedstr "%F{yellow}+"
zstyle ':vcs_info:*' formats "%F{cyan}%c%u (%b) %f"
zstyle ':vcs_info:*' actionformats '[%b|%a]'
precmd () { vcs_info }

# completion
zstyle ':completion:*' matcher-list '' 'm:{a-z}={A-Z}'
zstyle ':completion:*' menu select
fpath=($HOMEBREW_DIR/share/zsh/site-functions $fpath)
autoload -U compinit
compinit -u

# history
[ -z "$HISTFILE" ] && HISTFILE="$HOME/.zsh_history"
HISTSIZE=500000
SAVEHIST=500000
setopt extended_history
setopt hist_expire_dups_first
setopt hist_ignore_dups
setopt hist_ignore_space
setopt hist_verify
setopt inc_append_history
setopt share_history

# zsh-autosuggestions のプラグインディレクトリを追加
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8' # 提案をグレーに設定
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh

# プロンプトカスタマイズ
PROMPT='%B%F{031}%n@%m%f%b : %F{032}%~%f%F{cyan}$vcs_info_msg_0_%f%F{037}🌙 >%f '

# npm/npx の使用を確認付きで制限（サプライチェーン攻撃対策）
npm() {
  # 非対話 or 明示許可なら確認なしで通す
  if [ -n "${USE_NPM_ANYWAY:-}" ] || [ ! -t 0 ]; then
    command npm "$@"
    return
  fi
  printf "⚠️ pnpm を推奨しています。\n"
  printf "本当に npm を実行しますか？ [y/N] "
  IFS= read -r ans || { echo; return 1; }
  case "$ans" in
    y|Y|yes|YES)
      command npm "$@"
      ;;
    *)
      echo "中止しました。"
      return 1
      ;;
  esac
}

npx() {
  # 非対話 or 明示許可なら確認なしで通す
  if [ -n "${USE_NPM_ANYWAY:-}" ] || [ ! -t 0 ]; then
    command npx "$@"
    return
  fi
  printf "⚠️ pnpm dlx を推奨します。\n"
  printf "本当に npx を実行しますか？ [y/N] "
  IFS= read -r ans || { echo; return 1; }
  case "$ans" in
    y|Y|yes|YES)
      command npx "$@"
      ;;
    *)
      echo "中止しました。代替例: pnpm dlx $*"
      return 1
      ;;
  esac
}