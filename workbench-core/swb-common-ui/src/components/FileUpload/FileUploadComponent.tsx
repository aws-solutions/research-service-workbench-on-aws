/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Button, ButtonProps, FormField, SpaceBetween } from '@cloudscape-design/components';
import React, { ChangeEvent, ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';

import { ChangeDetail, DismissDetail, FileMetadata } from './models/FileUpload';

import { SelectedFile } from './SelectedFile';
import { SelectedFileList } from './SelectedFileList';

export interface FileUploadProps {
  /**
   * A string that defines the file types the file input should accept.
   * This string is a comma-separated list of unique file type specifiers.
   * Because a given file type may be identified in more than one manner,
   * it's useful to provide a thorough set of type specifiers when you need
   * files of a given format.
   * Examples:
   * ".docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
   * "image/*"
   */
  accept?: string;
  /**
   * Adds an aria-label to the native control.
   * Use this if you don't have a visible label for this control.
   */
  ariaLabel?: string;
  /**
   * Specifies whether to add aria-required to the native control.
   */
  ariaRequired?: boolean;
  /**
   * Text displayed in the button element.
   */
  buttonText?: React.ReactNode;
  /**
   * Detailed information about the form field that's displayed below the label.
   */
  description?: React.ReactNode;
  /**
   * Specifies if the control is disabled, which prevents the user from
   * modifying the value and prevents the value from being included in a
   * form submission. A disabled control can't receive focus.
   */
  disabled?: boolean;
  /**
   * Text that displays as a validation message. If this is set to a
   * non-empty string, it will render the form field as invalid.
   */
  errorText?: React.ReactNode;
  /**
   * File metadata helps the user to validate and compare the files selected.
   * Choose the most relevant file metadata to display, based on your use case.
   */
  fileMetadata?: FileMetadata;
  /**
   * Constraint text that's displayed below the control. Use this to
   * provide additional information about valid formats, etc.
   */
  constraintText?: React.ReactNode;
  /**
   * Adds the specified ID to the root element of the component.
   */
  id?: string;
  /**
   * The main label for the form field.
   */
  label?: React.ReactNode;
  /**
   * Use to allow the selection of multiple files for upload from the
   * user's local drive. It uses tokens to display multiple files.
   * Files can be removed individually.
   */
  multiple?: boolean;
  /**
   * Called when the user selects a file.
   * The event detail contains the current value.
   * Not cancellable.
   */
  onChange?: (event: CustomEvent<ChangeDetail>) => void;

  /**
   * Specifies the currently selected file(s).
   */
  value?: File | File[];
}

const FileUploadComponent = (
  {
    accept = 'text/plain',
    ariaLabel,
    ariaRequired,
    buttonText,
    description,
    disabled,
    errorText,
    fileMetadata,
    constraintText,
    id,
    label,
    multiple = false,
    onChange,
    value
  }: FileUploadProps,
  ref: ForwardedRef<ButtonProps.Ref>
): JSX.Element => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleButtonClick = (): void => fileInput.current?.click();

  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      let newValue = undefined;
      if (target.files && target.files[0]) {
        newValue = multiple
          ? value instanceof Array
            ? [...value, target.files[0]]
            : [target.files[0]]
          : target.files[0];
      }
      if (onChange) {
        onChange(new CustomEvent<ChangeDetail>('change', { detail: { value: newValue } }));
      }
    },
    [value, multiple, onChange]
  );

  const handleDismiss = useCallback(
    ({ detail }: CustomEvent<DismissDetail>) => {
      const { index, file } = detail;
      let newValue = value;
      // eslint-disable-next-line security/detect-object-injection
      if (multiple && value instanceof Array && value[index]) {
        newValue = value.filter((f, i) => f !== file && i !== index);
      }
      if (onChange) {
        onChange(new CustomEvent<ChangeDetail>('change', { detail: { value: newValue } }));
      }
    },
    [value, multiple, onChange]
  );

  const baseButtonText = useMemo((): React.ReactNode => {
    return buttonText || `Choose file${multiple ? 's' : ''}`;
  }, [multiple, buttonText]);

  const selectedFiles = useMemo((): React.ReactNode => {
    if (errorText || !value) {
      return null;
    }

    if (!multiple && value instanceof File) {
      return <SelectedFile file={value} metadata={fileMetadata} multiple={false} />;
    }

    if (multiple && value instanceof Array) {
      return <SelectedFileList fileList={value} metadata={fileMetadata} onDismiss={handleDismiss} />;
    }

    return null;
  }, [errorText, value, multiple, fileMetadata, handleDismiss]);

  return (
    <SpaceBetween size="xs">
      <FormField
        controlId={id}
        label={label}
        description={description}
        errorText={errorText}
        constraintText={constraintText}
        data-testid={`fileUpload${id}`}
      >
        <Button ref={ref} iconName="upload" formAction="none" disabled={disabled} onClick={handleButtonClick}>
          <input
            id={id}
            ref={fileInput}
            type="file"
            multiple={false}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-required={ariaRequired ? 'true' : 'false'}
            accept={accept}
            onChange={handleChange}
            hidden
          />
          <span>{baseButtonText}</span>
        </Button>
      </FormField>
      {selectedFiles}
    </SpaceBetween>
  );
};

// eslint-disable-next-line @rushstack/typedef-var
const FileUpload = forwardRef(FileUploadComponent);
export default FileUpload;
