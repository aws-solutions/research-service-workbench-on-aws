#!/usr/bin/env bash

# This script bootstraps a workspace instance by preparing S3 study data to be
# mounted via the mount_s3.sh environment script.
# Note that mounting cannot be performed during initial bootstrapping
# because the instance's role will not yet have access to S3 study
# data since the associated resource policies aren't updated until after the
# CFN stack has been completed created.
S3_MOUNTS="$1"

# Exit if no S3 mounts were specified
[ -z "$S3_MOUNTS" -o "$S3_MOUNTS" = "[]" ] && exit 0

# Get directory in which this script is stored and define URL from which to download goofys
FILES_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Define a function to determine what type of environment this is
env_type() {
    if [ -d "/home/ec2-user/SageMaker" ]
    then
        printf "sagemaker"
    else
        echo "Error! Unknown env type" > '/var/log/messages'
        exit 1
    fi
}

# Define a function to update Jupyter configuration files
update_jupyter_config() {
    config_file="$1"

    cat << EOF | cut -b5- >> "$config_file"

    import subprocess
    from notebook.services.kernels.kernelmanager import AsyncMappingKernelManager

    subprocess.run(["/usr/local/bin/mount_s3.sh"])

    c.NotebookApp.kernel_manager_class = AsyncMappingKernelManager
EOF
}

# Install dependencies
case "$(env_type)" in
    "sagemaker") # Update config and restart Jupyter
        echo "Installing JQ"
        sudo mv "${FILES_DIR}/offline-packages/jq-1.5-linux64" "/usr/local/bin/jq"
        chmod +x "/usr/local/bin/jq"
        echo "Finish installing jq"
        ;;
esac

echo "Copying Goofys from bootstrap.sh"
sudo mv "${FILES_DIR}/offline-packages/goofys" /usr/local/bin/goofys
chmod +x "/usr/local/bin/goofys"

# Create S3 mount script and config file
echo "Mounting S3"
chmod +x "${FILES_DIR}/bin/mount_s3.sh"
ln -s "${FILES_DIR}/bin/mount_s3.sh" "/usr/local/bin/mount_s3.sh"
printf "%s" "$S3_MOUNTS" > "/usr/local/etc/s3-mounts.json"
echo "Finish mounting S3"

OS_VERSION=`cat /etc/os-release | grep VERSION= | sed 's/VERSION="//' | sed 's/"//'`

# Apply updates to environments based on environment type
case "$(env_type)" in
    "sagemaker") # Update config and restart Jupyter
        if [ $OS_VERSION = '2' ]
        then
            echo "Installing fuse for AL2"
            cd "${FILES_DIR}/offline-packages/sagemaker/fuse-2.9.4_AL2"
            sudo yum --disablerepo=* localinstall -y *.rpm
            echo "Finish installing fuse"
            echo "Installing boto3 for AL2"
            cd "${FILES_DIR}/offline-packages/sagemaker/boto3"
            sudo yum --disablerepo=* localinstall -y python2-boto3-1.4.4-1.amzn2.noarch.rpm
            echo "Finish installing boto3"
        else
            echo "Error! Unsupported OS version"
            exit 1
        fi
        
        cat "${FILES_DIR}/offline-packages/sagemaker/jupyter_notebook_config.py" > "/home/ec2-user/.jupyter/jupyter_notebook_config.py"
        update_jupyter_config "/home/ec2-user/.jupyter/jupyter_notebook_config.py"

        # TODO: Automate running mount_s3 script. update_jupyter_config does not seem to work on JupyterLabv3
        echo "Setting up a one-time mount script."

        sudo systemctl restart jupyter-server
        ;;
esac

exit 0