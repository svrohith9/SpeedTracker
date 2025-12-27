#!/bin/bash
set -euo pipefail

xcodegen generate --spec project.yml

PBXPROJ="SpeedTracker.xcodeproj/project.pbxproj"
if [[ -f "$PBXPROJ" ]]; then
  perl -pi -e 's/objectVersion = 77;/objectVersion = 60;/' "$PBXPROJ"
fi
