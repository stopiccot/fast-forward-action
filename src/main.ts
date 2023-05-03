import * as core from '@actions/core'
import * as github from '@actions/github';
// import { Octokit } from "@octokit/rest";
import {wait} from './wait'

function get_current_pull_request_number(): number {
  if (!github.context.payload.issue || !github.context.payload.issue.pull_request) {
    throw new Error('Issue is not a pull request! No pull request found in context');
  }
  
  return github.context.payload.issue.number;
};

// async function get_pull_request(octokit: Octokit, pr_number: number): Promise<Octokit.PullsGetResponse> {
//   const getPrResponse = await octokit.pulls.get({
//     owner: github.context.repo.owner,
//     repo: github.context.repo.repo,
//     pull_number: pr_number
//   });

//   return getPrResponse.data;
// };

async function run(): Promise<void> {
  try {
    const github_token = core.getInput('token');

    const pr_number = get_current_pull_request_number();
    core.info(`PR NUMBER: ${pr_number}`);

    let octokit = github.getOctokit(github_token);
    core.info("==============================");
    core.info(octokit.constructor.name);
    core.info("==============================");
    let pr = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pr_number
    });
    core.info(JSON.stringify(pr));
    core.info("==============================");
    await octokit.rest.git.updateRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: `heads/${pr.data.base.ref}`,
      sha: pr.data.head.sha,
      force: false
    });
    core.info("==============================");

    //var restClient = new GitHub(github_token);

    // const pr_number = client.get_current_pull_request_number();
    // const source_head = await client.get_pull_request_source_head_async(pr_number);
    // const target_base = await client.get_pull_request_target_base_async(pr_number);

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
