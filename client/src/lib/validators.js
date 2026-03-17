export function required(value) {
   return value.toString().trim().length > 0;
}

export function length({ min, max }) {
   return (value) => {
      const len = value.toString().trim().length;
      if (min && len < min) return false;
      if (max && len > max) return false;
      return true;
   };
}

export function email(value) {
   return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
      value
   );
}
