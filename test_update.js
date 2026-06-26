const check = async () => {
  try {
    const res = await fetch('https://clinova-woad.vercel.app/api/public/debug-users');
    const data = await res.json();
    console.log(data);
    if (data.message === 'Role changed to ADMIN') {
      console.log('SUCCESS');
      process.exit(0);
    }
  } catch (e) {
    console.error(e.message);
  }
  setTimeout(check, 5000);
};
check();
