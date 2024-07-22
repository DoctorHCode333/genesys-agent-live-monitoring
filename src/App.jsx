import React, { useState, useEffect } from 'react';
import { authenticate, getAllUsers, createNotificationChannel, subscribeToTopics } from './utils/genesysAPI';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      await authenticate(); // Authenticate when the component mounts
      const allUsers = await getAllUsers(); // Fetch all users
      setUsers(allUsers);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit results to 10 users
    setFilteredUsers(results);
  }, [query, users]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleCheckboxChange = async (userId) => {
    const newSelectedUsers = {
      ...selectedUsers,
      [userId]: !selectedUsers[userId],
    };
    setSelectedUsers(newSelectedUsers);

    if (newSelectedUsers[userId]) {
      // User is selected, subscribe to their notifications
      const channel = await createNotificationChannel();
      const topics = [
        { id: `v2.users.${userId}.presence` },
        { id: `v2.users.${userId}.conversations` },
      ];
      await subscribeToTopics(channel.id, topics);

      const ws = new WebSocket(channel.connectUri);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.topicName === `v2.users.${userId}.conversations` && data.eventBody.active) {
          alert(`${data.eventBody.participants[0].name} has started an interaction`);
        }
      };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-8 grid">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">Genesys Cloud User Search</h1>
      <div className="container mx-auto max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="space-y-4">
          {filteredUsers.length === 0 && query && <p className="text-center text-gray-500">No users found</p>}
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={!!selectedUsers[user.id]}
                onChange={() => handleCheckboxChange(user.id)}
                className="h-5 w-5 text-orange-500 border-gray-300 rounded"
              />
              <label className="text-gray-800 font-medium">{user.name}</label>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default App;