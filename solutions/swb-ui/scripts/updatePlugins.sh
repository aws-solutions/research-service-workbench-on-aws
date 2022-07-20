#!/bin/bash
echo "Starting Update of Plugins";
cd ./solutions/swb-plugins;
for plugin in *; do
    if [ -d "$plugin" ]; then
        pluginPackageName=$(jq -r '.name' ./$plugin/package.json);
        pluginUpper=$(echo "${plugin}" | tr “[a-z]” “[A-Z]”);
        if ! $(jq --arg pluginName $pluginPackageName 'any(.projects[].packageName == $pluginName; .)' ../../rush.json); then
            echo "Adding $pluginPackageName to rush.json";
            jq --arg pluginName $pluginPackageName --arg pluginFolder "solutions/swb-plugins/$plugin" '.projects += [{"packageName": $pluginName, "projectFolder": $pluginFolder, "reviewCategory": "production", "shouldPublish": true}]' ../../rush.json > ../../output_rush.json;
            mv ../../output_rush.json  ../../rush.json;
            echo "Added $pluginPackageName to rush.json";
            echo "Adding $pluginPackageName to package.json of swb-ui";
            jq --arg pluginName $pluginPackageName '.dependencies += {($pluginName): "workspace:*"}' ../swb-ui/package.json > ../swb-ui/output_package.json;
            mv ../swb-ui/output_package.json ../swb-ui/package.json;
            echo "Added $pluginPackageName to package.json of swb-ui";
            echo "Created new page for $pluginPackageName in swb-ui/src/pages/apps using name $plugin";
            cp ../swb-ui/scripts/templates/plugin_page_template.txt ../swb-ui/src/pages/apps/$plugin.tsx;
            sed -i '' "s|<--Insert--Plugin--Package--Name-->|$pluginPackageName|g" ../swb-ui/src/pages/apps/$plugin.tsx;
            sed -i '' "s|<--Insert--Plugin--Name-->|$pluginUpper|g" ../swb-ui/src/pages/apps/$plugin.tsx;
            sed -i '' "s|<--Insert--Formal--Plugin--Name-->|$plugin|g" ../swb-ui/src/pages/apps/$plugin.tsx;
            echo "Created new page for $pluginPackageName in swb-ui/src/pages/apps using name $plugin";
        else
            echo "$pluginPackageName already added to rush.json";
        fi
    fi
done
for page in ../swb-ui/src/pages/apps/*; do
    if [[ $page == *.tsx ]]; then
        pluginExists="false";        
        for plugin in *; do
            if [ -d "$plugin" ]; then
                if [[ $plugin == $(basename $page .tsx) ]]; then
                    pluginExists="true";
                fi
            fi
        done
        echo "Plugin for $(basename $page) Exists: $pluginExists";
        if [[ $pluginExists == "false" ]]; then
            pluginPackageName=$(head -n 1 $page | grep -o '".*"' | tr -d '"');
            jq --arg pluginName $pluginPackageName 'del(.projects[] | select(.packageName == $pluginName))' ../../rush.json > ../../output_rush.json;
            mv ../../output_rush.json  ../../rush.json;
            jq 'del(.dependencies."'"$pluginPackageName"'")' ../swb-ui/package.json > ../swb-ui/output_package.json;
            mv ../swb-ui/output_package.json ../swb-ui/package.json;
            rm $page;
        fi
    fi
done 
echo "Running rush update";
rush update;
echo "Fininshed Updating of Plugins";
echo "You may now run 'rush build' to build Service Workbench.";
