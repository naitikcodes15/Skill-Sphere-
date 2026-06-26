import React from 'react';

interface SearchUser {
  id: string;
  username: string;
}

interface AddFriendProps {
  onSearch: () => void;
  searchResults: SearchUser[];
  onAddFriend: (user: SearchUser) => void;
  setSearchName: (name: string) => void;
}

const AddFriend: React.FC<AddFriendProps> = ({ onSearch, searchResults, onAddFriend, setSearchName }) => {
  return (
    <div className="bg-[#313338] p-5 px-7 h-full text-white font-sans">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-[1.2rem] font-bold mb-2 uppercase">Add Friend</h2>
          <p className="text-[#b5bac1] text-[0.9rem]">
            You can add friends with their unique username.
          </p>
        </div>
        <div>
          <img
            src="https://id-test-11.slatic.net/p/3551525a7587844005e83489814421d0.png"
            alt="Wumpus"
            className="w-20 h-auto"
          />
        </div>
      </div>

      <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#111214]">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter a username (e.g. soul_honest)"
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1 bg-transparent border-none text-[#dbdee1] text-base outline-none placeholder:text-[#4f545c]"
          />
          <button
            onClick={onSearch}
            className="bg-[#e67e22] text-white px-5 py-2 rounded font-semibold text-[0.85rem] cursor-pointer hover:bg-[#d35400] disabled:bg-[#3c45a5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {searchResults.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center bg-[#2b2d31] p-3 rounded-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5865f2] flex items-center justify-center font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
            <button
              onClick={() => onAddFriend(user)}
              className="bg-[#e67e22] px-4 py-2 rounded text-sm font-semibold hover:bg-[#d35400]"
            >
              Send Friend Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddFriend;
