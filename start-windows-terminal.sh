#!/bin/bash
# This is a conveniece script for starting different modes of altinn studio
# Its target is to open windows terminal split windows with everything you need
# for different kinds of development.

if [[ -n $1 ]] ;
then

    n="$1"
else
  echo "What mode do you want to run altinn studio"
  echo "   1) Develop studio"
  echo "  i1) npm install for studio"
  echo ""
  echo "   2) Run LocalTest"
  # echo "  i2) npm install for localtest"
  echo ""
  echo "   3) LocalTest with local js"
  echo "  i3) npm install for local js"
  echo ""

  echo "   q) quit" 

  # Get user response
  read n

fi

# Ensure directories are correct
cd "$(dirname "$0")"

case $n in
  1) 
      echo "Develop studio";
      docker compose -fsrc/development/docker-compose.yml down 2>/dev/null
      wt -d 'src/studio/src/designer/backend' PowerShell -c "npm run gulp-develop-designer-frontend" \; split-pane -d 'src/studio'  docker compose "-fdocker-compose.yml" "-fdocker-compose.no-designer.yml" "up" "--build" \; split-pane -d 'src/studio/src/designer/backend' PowerShell -c "\$env:DOTNET_WATCH_SUPPRESS_LAUNCH_BROWSER='1'\; dotnet watch run"
      echo "Visit http://altinn3.no to see test in browser"
      echo "Click  <<Need an account? Register now.>> if you don't have a local user yet"
      ;;
  i1) 
      echo "npm install for Develop studio";
      cd src/studio/src/designer/backend
      npm ci
      npm run gulp-install-deps
      dotnet build
      npm run gulp
      ;;
  2) 
      echo "Run LocalTest"
      docker compose -fsrc/studio/docker-compose.yml down
      # AppRepositoryPath=$(node -pe 'JSON.parse(process.argv[1]).LocalPlatformSettings.AppRepositoryBasePath' "$(cat src/development/LocalTest/appsettings.json)")
      # split-pane -d "$AppRepositoryPath" bash
      wt --title 'Run LocalTest' -d 'src/development'  docker compose "up" "--build" \; split-pane -d 'src/development/LocalTest' dotnet run 
      echo "Visit http://altinn3local.no to see test in browser"
      ;;
  # i2)
  #     echo "npm install for LocalTest"
      
  #     ;;
  
  3) 
      echo "Run LocalTest with local js"
      docker compose -fsrc/studio/docker-compose.yml down
      export SUB_FILTER="sub_filter 'https://altinncdn.no/toolkits/altinn-app-frontend/3/altinn-app-frontend.js'  'http://localhost:8080/altinn-app-frontend.js';"
      wt --title 'LocalTest Local js' -d 'src/Altinn.Apps/AppFrontend/react/altinn-app-frontend' PowerShell -c "npm run start" \; split-pane -V -d 'src/development'  docker compose "up" "--build" \; split-pane -d 'src/development/LocalTest' dotnet run
      echo "Visit http://altinn3local.no to see test in browser"
      ;;
  i3)
      echo "npm install for LocalTest with local js"
      cd src/Altinn.Apps/AppFrontend/react
      npm install # only needed first time, or when dependencies are updated
      npm run install-deps # only needed first time, or when dependencies are updated
      ;;
  q)
      ;;
  *) 
      echo "invalid option";;
esac