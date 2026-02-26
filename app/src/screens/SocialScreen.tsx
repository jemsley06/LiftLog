import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";
import { useFriends } from "../hooks/useFriends";
import {
  createParty,
  getActiveParties,
  getPartyMembers,
  endParty,
} from "../services/social";
import Button from "../components/ui/Button";
import FriendCard from "../components/social/FriendCard";
import PartyCard from "../components/social/PartyCard";
import Leaderboard from "../components/social/Leaderboard";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

type Tab = "friends" | "parties";

function PartyDetail({
  partyId,
  currentUserId,
  onEnd,
}: {
  partyId: string;
  currentUserId: string;
  onEnd: () => void;
}) {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    getPartyMembers(partyId).then((data) => setMembers(data || []));
  }, [partyId]);

  return (
    <View className="mb-3">
      <Leaderboard
        entries={members.map((m: any, i: number) => ({
          userId: m.user_id,
          username: m.profiles?.username || "Unknown",
          score: m.score || 0,
          rank: i + 1,
        }))}
        currentUserId={currentUserId}
      />
      <Button
        title="End Party"
        variant="danger"
        size="sm"
        onPress={onEnd}
        className="mt-2"
      />
    </View>
  );
}

export default function SocialScreen() {
  const { user } = useAuth();
  const {
    friends,
    pendingRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const [tab, setTab] = useState<Tab>("friends");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [partyName, setPartyName] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [activeParties, setActiveParties] = useState<any[]>([]);

  const loadParties = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getActiveParties(user.id);
      setActiveParties(data || []);
    } catch (error: any) {
      console.error("Failed to load parties:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (tab === "parties") loadParties();
  }, [tab, loadParties]);

  const handleSendFriendRequest = async () => {
    if (!friendUsername.trim()) return;
    try {
      await sendRequest(friendUsername.trim());
      setFriendUsername("");
      setShowAddFriend(false);
      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Could not send friend request. Make sure the username is correct."
      );
    }
  };

  const handleCreateParty = async () => {
    if (!partyName.trim() || !user) return;
    try {
      await createParty(partyName.trim(), user.id);
      setPartyName("");
      setShowCreateParty(false);
      await loadParties();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleEndParty = (partyId: string) => {
    Alert.alert("End Party", "Are you sure you want to end this party?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          await endParty(partyId);
          await loadParties();
          setSelectedPartyId(null);
        },
      },
    ]);
  };

  const getFriendProfile = (friendship: any) => {
    if (friendship.requester?.id === user?.id) {
      return friendship.addressee;
    }
    return friendship.requester;
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Social</Text>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row mx-4 mb-4 bg-dark-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setTab("friends")}
          className={`flex-1 py-2 rounded-lg items-center ${
            tab === "friends" ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              tab === "friends" ? "text-white" : "text-dark-400"
            }`}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("parties")}
          className={`flex-1 py-2 rounded-lg items-center ${
            tab === "parties" ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              tab === "parties" ? "text-white" : "text-dark-400"
            }`}
          >
            Parties
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {tab === "friends" ? (
          <>
            <Button
              title="Add Friend"
              variant="outline"
              size="sm"
              onPress={() => setShowAddFriend(true)}
              icon={
                <Ionicons
                  name="person-add-outline"
                  size={16}
                  color="#818CF8"
                />
              }
              className="mb-4"
            />

            {pendingRequests.length > 0 && (
              <>
                <Text className="text-dark-300 text-sm font-semibold mb-2">
                  Pending Requests
                </Text>
                {pendingRequests.map((req: any) => (
                  <FriendCard
                    key={req.id}
                    username={req.requester?.username || "Unknown"}
                    isPending
                    onAccept={() => acceptRequest(req.id)}
                    onDecline={() => declineRequest(req.id)}
                  />
                ))}
              </>
            )}

            <Text className="text-dark-300 text-sm font-semibold mb-2 mt-2">
              Friends ({friends.length})
            </Text>
            {friends.map((f: any) => {
              const profile = getFriendProfile(f);
              return (
                <FriendCard
                  key={f.id}
                  username={profile?.username || "Unknown"}
                  onRemove={() => removeFriend(f.id)}
                />
              );
            })}

            {friends.length === 0 && pendingRequests.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="people-outline" size={48} color="#334155" />
                <Text className="text-dark-400 text-base mt-4">
                  No friends yet. Add some!
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Button
              title="Create Party"
              variant="outline"
              size="sm"
              onPress={() => setShowCreateParty(true)}
              icon={
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color="#818CF8"
                />
              }
              className="mb-4"
            />

            {activeParties.map((p: any) => (
              <View key={p.party_id}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedPartyId(
                      selectedPartyId === p.party_id ? null : p.party_id
                    )
                  }
                >
                  <PartyCard
                    name={p.parties?.name || "Party"}
                    memberCount={1}
                    isActive={p.parties?.is_active || false}
                    userScore={p.score}
                  />
                </TouchableOpacity>
                {selectedPartyId === p.party_id && (
                  <PartyDetail
                    partyId={p.party_id}
                    currentUserId={user?.id || ""}
                    onEnd={() => handleEndParty(p.party_id)}
                  />
                )}
              </View>
            ))}

            {activeParties.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="trophy-outline" size={48} color="#334155" />
                <Text className="text-dark-400 text-base mt-4">
                  No active parties. Create one to compete!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        title="Add Friend"
      >
        <Input
          label="Username"
          placeholder="Enter friend's username"
          autoCapitalize="none"
          value={friendUsername}
          onChangeText={setFriendUsername}
        />
        <Button
          title="Send Request"
          onPress={handleSendFriendRequest}
          className="mt-2"
        />
      </Modal>

      {/* Create Party Modal */}
      <Modal
        visible={showCreateParty}
        onClose={() => setShowCreateParty(false)}
        title="Create Party"
      >
        <Input
          label="Party Name"
          placeholder="e.g., Leg Day Battle"
          value={partyName}
          onChangeText={setPartyName}
        />
        <Button
          title="Create"
          onPress={handleCreateParty}
          className="mt-2"
        />
      </Modal>
    </SafeAreaView>
  );
}
