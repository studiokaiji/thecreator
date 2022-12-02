import { task } from 'hardhat/config';

task('deploy').setAction(async (_, env) => {
  await env.unlock.deployProtocol(11, 11);
});
