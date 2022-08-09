#!/bin/bash
######################
#---Example--Code----#
srun hostname #Prints to StandardOutput name of compute node working on job
cp ../data.txt data_copy.txt #Creates copy of example data.txt and places it in output
#---Example--Code----#
######################
#Everything in s3_folder_name/output is copied back to same S3 bucket
#Ensure bucket name is filled in for your account below
aws s3 cp . s3://<bucketName>/test_job/output/ --recursive