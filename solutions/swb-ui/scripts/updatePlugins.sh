#!/bin/bash
echo "Starting Update of Plugins";
cd ./solutions/swb-plugins;
for plugin in *; do
    if [ -d "$plugin" ]; then
        pluginUpper=$(echo "${plugin}" | tr “[a-z]” “[A-Z]”);
        if ! $(jq --arg pluginName $pluginUpper 'any(.projects[].packageName == $pluginName; .)' ../../rush.json); then
            echo "Adding $pluginUpper to rush.json";
            jq --arg pluginName $pluginUpper --arg pluginFolder "solutions/swb-plugins/$plugin" '.projects += [{"packageName": $pluginName, "projectFolder": $pluginFolder, "reviewCategory": "production", "shouldPublish": true}]' ../../rush.json > ../../output_rush.json;
            echo "Added $pluginUpper to rush.json";
            echo "Adding $pluginUpper to package.json of swb-ui";
            jq --arg pluginName $pluginUpper '.dependencies += {($pluginName): "workspace:*"}' ../swb-ui/package.json > ../swb-ui/output_package.json;
            echo "Added $pluginUpper to package.json of swb-ui";
            echo "Creating new page for $pluginUpper in swb-ui/src/pages/apps";
            cp ../swb-ui/scripts/templates/plugin_page_template.txt ../swb-ui/src/pages/apps/$pluginUpper.tsx;
            sed -i '' "s/<--Insert--Plugin--Name-->/$pluginUpper/g" ../swb-ui/src/pages/apps/$pluginUpper.tsx;
            echo "Created new page for $pluginUpper in swb-ui/src/pages/apps";
        else
            echo "$plugin already added."
        fi
    fi
done
echo "Running rush update";
rush update;
echo "Fininshed Updating of Plugins";
echo "You may now run 'rush build' to build Service Workbench.";
