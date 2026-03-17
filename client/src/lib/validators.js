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
   const parts = value.split('@');
   if (parts.length !== 2) return false;
   const [local, domain] = parts;
   if (!local || !domain) return false;
   if (!domain.includes('.')) return false;
   return local.length <= 64 && domain.length <= 253;
}
