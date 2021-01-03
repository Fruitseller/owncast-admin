import React, { useState, useContext } from 'react';
import { Form, Switch, Tooltip } from 'antd';
import { FormItemProps } from 'antd/es/form';

import { InfoCircleOutlined } from '@ant-design/icons';

import { TEXTFIELD_DEFAULTS, RESET_TIMEOUT, SUCCESS_STATES, postConfigUpdateToAPI } from './constants';

import { ToggleSwitchProps } from '../../../types/config-section';
import { ServerStatusContext } from '../../../utils/server-status-context';

export const TEXTFIELD_TYPE_TEXT = 'default';
export const TEXTFIELD_TYPE_PASSWORD = 'password'; // Input.Password
export const TEXTFIELD_TYPE_NUMBER = 'numeric';
export const TEXTFIELD_TYPE_TEXTAREA = 'textarea';


export default function ToggleSwitch(props: ToggleSwitchProps) {
  const [submitStatus, setSubmitStatus] = useState<FormItemProps['validateStatus']>('');
  const [submitStatusMessage, setSubmitStatusMessage] = useState('');

  let resetTimer = null;

  const serverStatusData = useContext(ServerStatusContext);
  const { setConfigField } = serverStatusData || {};
  
  const {
    fieldName,
    initialValues = {},
    configPath = '',
    disabled = false,
  } = props;

  const initialValue = initialValues[fieldName] || false;
  
  const defaultDetails =  TEXTFIELD_DEFAULTS[configPath] || TEXTFIELD_DEFAULTS;

  const {
    apiPath = '',
    label = '',
    tip = '',
  } = defaultDetails[fieldName] || {};

  const resetStates = () => {
    setSubmitStatus('');
    clearTimeout(resetTimer);
    resetTimer = null;
  }

  const handleChange = async checked => {
    setSubmitStatus('validating');
    await postConfigUpdateToAPI({
      apiPath,
      data: { value: checked },
      onSuccess: () => {
        setConfigField({ fieldName, value: checked, path: configPath });
        setSubmitStatus('success');
      },
      onError: (message: string) => {
        setSubmitStatus('error');
        setSubmitStatusMessage(`There was an error: ${message}`);
      },
    });
    resetTimer = setTimeout(resetStates, RESET_TIMEOUT);
  }

  const {
    icon: newStatusIcon = null,
    message: newStatusMessage = '',
  } = SUCCESS_STATES[submitStatus] || {};

  const tipComponent = tip ? (
    <span className="info">
      <Tooltip title={tip}>
        <InfoCircleOutlined />
      </Tooltip>
    </span>
  ) : null;
 
  return (
    <div className="toggleswitch-container">
      <div className="toggleswitch">
        <Form.Item
          name={fieldName}
          validateStatus={submitStatus}
        >
          <Switch
            className={`switch field-${fieldName}`}
            loading={submitStatus === 'validating'}
            onChange={handleChange}
            checked={initialValue}
            checkedChildren="ON"  
            unCheckedChildren="OFF"
            disabled={disabled}
          />
        </Form.Item>

        <span className="label">{label}</span>
        {tipComponent}
      </div>
      <div className={`status-message ${submitStatus || ''}`}>
        {newStatusIcon} {newStatusMessage} {submitStatusMessage}
      </div>
    </div>
  ); 
}
