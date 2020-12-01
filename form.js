import React, {useState, useEffect} from 'react';

export const useForm = (validate, fetcher, defaultValues={}, fields=null) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const newValues = {...values};
    newValues[e.target.name] = e.target.value;
    setValues(newValues);
  }

  const handleValueChange = (name, value) => {
    setValues({...values, [name]: value});
  }

  const handleSubmit = e => {
    e.preventDefault();
    const errorsObj = {};
    setErrors(errorsObj);
    if (Object.keys(errorsObj).length === 0) {
      let formFields = {};
      if (fields) {
        for (const el of fields) {
          formFields[el] = values[el];
        }
      } else {
        formFields = values;
      }
      fetcher.send(formFields);
    }
  }

  return {
    values: values, errors: errors, handleChange: handleChange,
    handleValueChange: handleValueChange, handleSubmit: handleSubmit,
    setErrors: setErrors
  }
}