import { task } from 'hardhat/config';

task('deploy').setAction(async (_, env) => {
  return env.unlock.deployProtocol(11, 11);
});
