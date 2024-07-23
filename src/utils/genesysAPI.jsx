import { clientConfig } from './clientConfig';
import platformClient from 'purecloud-platform-client-v2';

const client = platformClient.ApiClient.instance;
const { clientId, redirectUri } = clientConfig;

client.setEnvironment(platformClient.PureCloudRegionHosts.us_west_2); // Genesys Cloud region

const userApi = new platformClient.UsersApi();
const qualityApi = new platformClient.QualityApi();
const notificationsApi = new platformClient.NotificationsApi();

export async function authenticate() {
  try {
    await client.loginImplicitGrant(clientId, redirectUri, { state: 'state' });
    console.log('Logged in');
  } catch (err) {
    console.error('Error during login', err);
  }
}

export const getAllUsers = async () => {
  try {
    const users = await userApi.getUsers({ pageSize: 100 }); // Adjust pageSize as needed
    return users.entities;
  } catch (err) {
    console.error('Error fetching users', err);
    return [];
  }
};

export const createNotificationChannel = async () => {
  try {
    const channel = await notificationsApi.postNotificationsChannels();
    return channel;
  } catch (err) {
    console.error('Error creating notification channel', err);
  }
};

export const subscribeToTopics = async (channelId, topics) => {
  try {
    await notificationsApi.putNotificationsChannelSubscriptions(channelId, topics);
  } catch (err) {
    console.error('Error subscribing to topics', err);
  }
};

// Get the list of available users.
export const fetchUsersData = async () => {
    try {
        const data = await userApi.getUsers()
        if (data && data.entities) {
            const rows = data.entities.map((user) => ({
                id: user.id || 'N/A',
                divisionId: user.division ? user.division.id : 'N/A',
                email: user.email || 'N/A',
                state: user.state || 'N/A',
            }));
            const columns = [
                { field: 'id', headerName: 'ID', width: 300 },
                { field: 'divisionId', headerName: 'Division Id', width: 300 },
                { field: 'email', headerName: 'E-mail / Username', width: 300 },
                { field: 'state', headerName: 'State', width: 80 },
            ];

            const transformedUserData = {
                rows,
                columns,
            }
            return transformedUserData;
        } else {
            return [];
        }
    } catch (err) {
        console.log("There was a failure calling getUsers", err);
    };

}

// Queries Evaluations and returns a paged list
export const fetchEvalData = async () => {
    try {
        const evalData = await qualityApi.getQualityEvaluationsQuery(opts)
        console.log(evalData);
        if (evalData && evalData.entities) {
            const rows = evalData.entities.map((user) => ({
                id: user.agent.id || 'N/A',
                evaluatorId: user.evaluator.id ? user.evaluator.id : 'N/A',
                evaluationScore: user.evaluationSource.id || 'N/A',
                status: user.status || 'N/A',
            }));
            const columns = [
                { field: 'id', headerName: 'Agent ID', width: 300 },
                { field: 'evaluatorId', headerName: 'Evaluator', width: 300 },
                { field: 'evaluationScore', headerName: 'Evaluation Score', width: 300 },
                { field: 'status', headerName: 'Status', width: 80 },
            ];

            const transformedEvalData = {
                rows,
                columns,
            }
            return transformedEvalData;
        } else {
            return [];
        }
    } catch (err) {
        console.log("There was a failure calling getQualityEvaluationsQuery");
        console.error(err);
    };
}




