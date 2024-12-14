import { Liveblocks } from '@liveblocks/node';

export const liveblocks = new Liveblocks({
  secret: process.env.Liveblocks_SECRET_KEY as string,
});
