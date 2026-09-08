#!/bin/zsh
set -eu
native_dir="${0:A:h}"
if [[ ! -x "$native_dir/build/Haasome Apple.app/Contents/MacOS/HaasomeApple" ]]; then
  zsh "$native_dir/build.sh"
fi
open -n "$native_dir/build/Haasome Apple.app" --args "$@"
