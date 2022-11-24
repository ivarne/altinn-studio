import type { ChangeEventHandler, FocusEventHandler, KeyboardEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { ILanguage } from '../../types';
import { getTranslation } from '../../utils/language';
import { setRequired } from '../../features/editor/schemaEditorSlice';
import { Checkbox, Select, TextField } from '@altinn/altinn-design-system';
import classes from './PropertyItem.module.css';
import { IconButton } from '../common/IconButton';
import { IconImage } from '../common/Icon';
import { getTypeOptions } from './helpers/options';
import type { FieldType } from '@altinn/schema-model';

export interface IPropertyItemProps {
  fullPath: string;
  inputId: string;
  language: ILanguage;
  onChangeType: (path: string, type: FieldType) => void;
  onChangeValue: (path: string, value: string) => void;
  onDeleteField: (path: string, key: string) => void;
  onEnterKeyPress: () => void;
  readOnly?: boolean;
  required?: boolean;
  type: FieldType;
  value: string;
}

export function PropertyItem({
  fullPath,
  inputId,
  language,
  onChangeType,
  onChangeValue,
  onDeleteField,
  onEnterKeyPress,
  readOnly,
  required,
  type,
  value,
}: IPropertyItemProps) {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const dispatch = useDispatch();

  useEffect(() => setInputValue(value), [value]);
  const changeValueHandler: ChangeEventHandler<HTMLInputElement> = (e) =>
    setInputValue(e.target.value);

  const onBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    if (inputValue !== value) {
      onChangeValue(fullPath, e.target.value);
    }
  };

  const deleteHandler = () => onDeleteField?.(fullPath, value);

  const changeRequiredHandler: ChangeEventHandler<HTMLInputElement> = (e) =>
    dispatch(
      setRequired({
        path: fullPath,
        required: e.target.checked,
      })
    );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) =>
    e?.key === 'Enter' && onEnterKeyPress && onEnterKeyPress();

  const t = (key: string) => getTranslation(key, language);

  return (
    <>
      <div className={`${classes.nameInputCell} ${classes.gridItem}`}>
        <TextField
          aria-label={t('field_name')}
          id={inputId}
          value={inputValue}
          disabled={readOnly}
          onChange={changeValueHandler}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className={`${classes.typeSelectCell} ${classes.gridItem}`}>
        <Select
          hideLabel
          inputId={`${inputId}-typeselect`}
          label={t('type')}
          onChange={(type) => onChangeType(fullPath, type as FieldType)}
          options={getTypeOptions(t)}
          value={type}
        />
      </div>
      <span className={`${classes.requiredCheckCell} ${classes.gridItem}`}>
        <Checkbox
          checked={required ?? false}
          disabled={readOnly}
          hideLabel
          label={t('required')}
          name='checkedArray'
          onChange={changeRequiredHandler}
        />
      </span>
      <IconButton
        ariaLabel={t('delete_field')}
        icon={IconImage.Wastebucket}
        onClick={deleteHandler}
      />
    </>
  );
}
