const logBlock = (title: string, emoji: string, payload: any) => {
  console.log(`\n${emoji} ===== ${title} =====`);

  try {
    console.log(JSON.stringify(payload, null, 2));
  } catch {
    console.log(payload);
  }

  console.log(`${emoji} =========================\n`);
};

export const apiLogger = {
  request: (data: any) => {
    logBlock('API REQUEST', '🔵', data);
  },

  success: (data: any) => {
    logBlock('API SUCCESS', '🟢', data);
  },

  error: (data: any) => {
    logBlock('API ERROR', '🔴', data);
  },
};