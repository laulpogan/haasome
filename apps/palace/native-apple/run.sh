#!/bin/zsh
set -eu
native_dir="${0:A:h}"
if [[ ! -x "$native_dir/build/Haasome Apple.app/Contents/MacOS/HaasomeApple" ]]; then
  zsh "$native_dir/build.sh"
fi
if [[ "$#" -lt 2 || "$1" != "--media" ]]; then
  print -u2 -- "Usage: zsh run.sh --media /path/to/selected/austin/media [--latitude 30.3163 --longitude -97.7277]"
  exit 2
fi
open -n "$native_dir/build/Haasome Apple.app" --args "$@"
