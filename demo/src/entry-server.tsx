import { createHandler } from '@solidjs/start/entry';
import { StartServer } from '@solidjs/start/server';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html data-theme='mintun' lang='en'>
        <head>
          <meta charset='utf-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/favicon.ico' />
          <title>Mintun Collection Demo</title>
          {assets}
        </head>
        <body class='flex justify-center min-h-screen items-center w-full bg-base-300'>
          <div id='app' class='flex flex-col min-h-screen max-w-[1080px] w-full bg-base-100'>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
