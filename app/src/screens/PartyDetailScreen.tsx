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
import { useParty } from "../hooks/useParty";
import { useFriends } from "../hooks/useFriends";
import {
    endParty,
    getPartyMembers,
} from "../services/social";
import {
    subscribeToPartyScores,
    subscribeToPartyMembers,
} from "../services/realtime";
import Leaderboard from "../components/social/Leaderboard";
import InviteModal from "../components/social/InviteModal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function PartyDetailScreen({
    route,
    navigation,
}: any) {
    const { partyId, partyName, isCreator } = route.params;
    const { user } = useAuth();
    const { friends } = useFriends();
    const [members, setMembers] = useState<any[]>([]);
    const [showInvite, setShowInvite] = useState(false);
    const { inviteFriends } = useParty();

    const loadMembers = useCallback(async () => {
        try {
            const data = await getPartyMembers(partyId);
            setMembers(data || []);
        } catch (error) {
            console.error("Failed to load party members:", error);
        }
    }, [partyId]);

    // Initial load
    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    // Live score updates
    useEffect(() => {
        const unsubscribe = subscribeToPartyScores(partyId, () => {
            loadMembers();
        });
        return unsubscribe;
    }, [partyId, loadMembers]);

    // Live member joins/leaves
    useEffect(() => {
        const unsubscribe = subscribeToPartyMembers(partyId, () => {
            loadMembers();
        });
        return unsubscribe;
    }, [partyId, loadMembers]);

    const handleEndParty = () => {
        Alert.alert("End Party", "Are you sure you want to end this party?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "End",
                style: "destructive",
                onPress: async () => {
                    await endParty(partyId);
                    navigation.goBack();
                },
            },
        ]);
    };

    const handleInvite = async (friendIds: string[]) => {
        try {
            await inviteFriends(partyId, friendIds);
            Alert.alert("Success", "Invitations sent!");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send invitations.");
        }
    };

    const getFriendProfile = (friendship: any) => {
        if (friendship.requester?.id === user?.id) {
            return friendship.addressee;
        }
        return friendship.requester;
    };

    const getInviteFriendsList = () => {
        return friends.map((f: any) => {
            const profile = getFriendProfile(f);
            return {
                id: profile?.id || "",
                username: profile?.username || "Unknown",
            };
        });
    };

    // Compute stats
    const totalScore = members.reduce((sum: number, m: any) => sum + (m.score || 0), 0);
    const highestScorer = members.length > 0
        ? members.reduce((best: any, m: any) => (m.score || 0) > (best.score || 0) ? m : best, members[0])
        : null;

    const myMember = members.find((m: any) => m.user_id === user?.id);
    const myRank = members.findIndex((m: any) => m.user_id === user?.id) + 1;

    const leaderboardEntries = members.map((m: any, i: number) => ({
        userId: m.user_id,
        username: m.profiles?.username || "Unknown",
        score: m.score || 0,
        rank: i + 1,
    }));

    return (
        <SafeAreaView className="flex-1 bg-dark-900">
            {/* Header */}
            <View className="flex-row items-center px-4 pt-4 pb-2">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-3"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold">{partyName}</Text>
                    <Text className="text-dark-400 text-xs">
                        {members.length} {members.length === 1 ? "member" : "members"}
                    </Text>
                </View>
                <Badge label="Live" variant="success" size="md" />
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View className="flex-row mt-4 mb-4">
                    <Card className="flex-1 mr-2" padding="sm">
                        <Text className="text-dark-400 text-xs mb-1">Total Score</Text>
                        <Text className="text-white text-2xl font-bold">
                            {Math.round(totalScore)}
                        </Text>
                    </Card>
                    <Card className="flex-1 ml-2" padding="sm">
                        <Text className="text-dark-400 text-xs mb-1">Your Rank</Text>
                        <View className="flex-row items-center">
                            {myRank > 0 && myRank <= 3 && (
                                <Ionicons
                                    name="trophy"
                                    size={18}
                                    color={
                                        myRank === 1
                                            ? "#FFD700"
                                            : myRank === 2
                                                ? "#C0C0C0"
                                                : "#CD7F32"
                                    }
                                    style={{ marginRight: 6 }}
                                />
                            )}
                            <Text className="text-white text-2xl font-bold">
                                {myRank > 0 ? `#${myRank}` : "—"}
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Your Score */}
                <Card className="mb-4" padding="sm">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-dark-400 text-xs mb-1">Your Score</Text>
                            <Text className="text-primary-400 text-3xl font-bold">
                                {Math.round(myMember?.score || 0)}
                            </Text>
                        </View>
                        {highestScorer && (
                            <View className="items-end">
                                <Text className="text-dark-400 text-xs mb-1">
                                    Top Scorer
                                </Text>
                                <Text className="text-warning text-base font-bold">
                                    {highestScorer.profiles?.username || "Unknown"}
                                </Text>
                                <Text className="text-dark-300 text-xs">
                                    {Math.round(highestScorer.score || 0)} pts
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Leaderboard */}
                <Leaderboard
                    entries={leaderboardEntries}
                    currentUserId={user?.id || ""}
                />

                {/* Actions */}
                <View className="flex-row mt-4 mb-8">
                    <Button
                        title="Invite Friends"
                        variant="outline"
                        size="sm"
                        onPress={() => setShowInvite(true)}
                        icon={
                            <Ionicons
                                name="person-add-outline"
                                size={16}
                                color="#818CF8"
                            />
                        }
                        className="flex-1 mr-2"
                    />
                    {isCreator && (
                        <Button
                            title="End Party"
                            variant="danger"
                            size="sm"
                            onPress={handleEndParty}
                            className="flex-1"
                        />
                    )}
                </View>
            </ScrollView>

            {/* Invite Modal */}
            <InviteModal
                visible={showInvite}
                onClose={() => setShowInvite(false)}
                friends={getInviteFriendsList()}
                onInvite={handleInvite}
                partyName={partyName}
            />
        </SafeAreaView>
    );
}
