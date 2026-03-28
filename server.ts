import app from './src/app';
import { env } from './src/config/env';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
