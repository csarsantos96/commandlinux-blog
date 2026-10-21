// Validate Vercel's native GitHub dispatch before accessing newsletter secrets/state.
// https://vercel.com/docs/git/vercel-for-github#repository-dispatch-events
export function productionDeployment(event, projectId) {
  const payload = event?.client_payload;
  if (!projectId || !['vercel.deployment.success', 'vercel.deployment.promoted'].includes(event?.action)) {
    throw new Error('Expected a configured Vercel production event');
  }
  if (payload?.environment !== 'production' || payload.project?.id !== projectId || payload.git?.ref !== 'main') {
    throw new Error('Deployment is not from the blog production project/branch');
  }
  if (!Array.isArray(payload.alias) || !payload.alias.some(alias => ['commandlinux.dev', 'www.commandlinux.dev'].includes(alias))) {
    throw new Error('Deployment does not serve the blog production domain');
  }
  if (!/^[a-f0-9]{40}$/.test(payload.git?.sha ?? '')) throw new Error('Invalid deployed SHA');
  return payload.git.sha;
}
