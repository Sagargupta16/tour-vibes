import { useCallback, useState } from 'react';
import { animate } from 'framer-motion';
import { serverFieldErrors, validate } from '@/lib/validators';
import { ease } from '@/lib/motion';

const SHAKE = { x: [0, -10, 9, -6, 4, -2, 0] };

// Field state shared by the auth and profile forms. A field shows its error after
// it is left with a value or the form is submitted, re-checks while it shows one
// (so it clears the moment it is fixed), server 422s land on their fields, and the
// form shakes on every failed submit. `shakeRef` is the caller's ref on the element
// that shakes; it stays out of the returned object so render code never reads a ref.
export default function useAuthForm(initial, ruleMap, shakeRef) {
   const [values, setValues] = useState(initial);
   const [errors, setErrors] = useState({});
   const [formError, setFormError] = useState('');

   const shake = useCallback(() => {
      if (shakeRef?.current) animate(shakeRef.current, SHAKE, { duration: 0.45, ease: ease.out });
   }, [shakeRef]);

   const setValue = (name, value) => {
      const next = { ...values, [name]: value };
      setValues(next);
      if (errors[name] && ruleMap[name]) {
         setErrors((prev) => ({ ...prev, [name]: ruleMap[name](value, next) }));
      }
      setFormError('');
   };

   const field = (name) => ({
      id: name,
      name,
      value: values[name],
      error: errors[name] || '',
      onChange: (e) => setValue(name, e.target.value),
      onBlur: (e) => {
         const { value } = e.target;
         if (!value || !ruleMap[name]) return;
         setErrors((prev) => ({ ...prev, [name]: ruleMap[name](value, values) }));
      }
   });

   // Checks every field; on failure shakes and focuses the first bad one
   const validateAll = () => {
      const next = validate(values, ruleMap);
      setErrors(next);
      const first = Object.keys(ruleMap).find((key) => next[key]);
      if (!first) return true;
      shake();
      document.getElementById(first)?.focus();
      return false;
   };

   const fail = (err) => {
      const fields = serverFieldErrors(err);
      if (Object.keys(fields).length) setErrors((prev) => ({ ...prev, ...fields }));
      else setFormError(err?.message || 'Something went wrong. Please try again.');
      shake();
   };

   const reset = (next = initial) => {
      setValues(next);
      setErrors({});
      setFormError('');
   };

   return {
      values,
      errors,
      formError,
      field,
      setValue,
      setErrors,
      validateAll,
      fail,
      reset,
      shake
   };
}
