import {supabase} from '../../lib/supabase';
import moment from 'moment';

// User roles
export const USER_ROLES = {
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  HOUSEKEEPER: 'housekeeper',
};

// Enhanced chat message interface
export interface ChatMessage {
  id?: string;
  sender_id: string;
  receiver_id?: string;
  message: string;
  message_type: 'text' | 'support' | 'direct';
  chat_room_id?: string;
  created_at?: number;
  updated_at?: number;
  is_read: boolean;
  // Support message fields
  status?: string;
  priority?: string;
  subject?: string;
  user_name?: string;
  requested_by?: string;
  created_by?: string;
  updated_by?: string;
  is_created_by_admin_panel?: boolean;
}

// Get users based on role visibility
export const getVisibleUsers = async (
  currentUserRole: string,
  currentUserId: string,
) => {
  try {
    console.log('🔍 getVisibleUsers called with:', {
      currentUserRole,
      currentUserId,
    });

    let visibleRoles: string[] = [];

    // Define role-based visibility - all roles can see each other
    switch (currentUserRole) {
      case USER_ROLES.MANAGER:
        visibleRoles = [
          USER_ROLES.MANAGER,
          USER_ROLES.SUPERVISOR,
          USER_ROLES.HOUSEKEEPER,
        ];
        break;
      case USER_ROLES.SUPERVISOR:
        visibleRoles = [
          USER_ROLES.MANAGER,
          USER_ROLES.SUPERVISOR,
          USER_ROLES.HOUSEKEEPER,
        ];
        break;
      case USER_ROLES.HOUSEKEEPER:
        visibleRoles = [
          USER_ROLES.MANAGER,
          USER_ROLES.SUPERVISOR,
          USER_ROLES.HOUSEKEEPER,
        ];
        break;
      default:
        visibleRoles = [
          USER_ROLES.MANAGER,
          USER_ROLES.SUPERVISOR,
          USER_ROLES.HOUSEKEEPER,
        ];
    }

    console.log('🔍 Looking for roles:', visibleRoles);

    // First, let's see all users to debug
    const {data: allUsers, error: allUsersError} = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, role, avatar_url');

    console.log('🔍 All users in database:', allUsers);

    if (allUsersError) {
      console.error('Error fetching all users:', allUsersError);
    }

    // Now get filtered users
    const {data, error} = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, role, avatar_url')
      .in('role', visibleRoles)
      .neq('id', currentUserId);

    console.log('🔍 Filtered users:', data);

    if (error) {
      console.error('Error fetching visible users:', error);
      return [];
    }

    // If no users found with role filtering, try without role filter (fallback)
    if (!data || data.length === 0) {
      console.log(
        '🔍 No users found with role filter, trying without role filter...',
      );
      const {data: fallbackData, error: fallbackError} = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, role, avatar_url')
        .neq('id', currentUserId);

      console.log('🔍 Fallback users (no role filter):', fallbackData);

      if (fallbackError) {
        console.error('Error fetching fallback users:', fallbackError);
        return [];
      }

      // If we get users without role filter, assign default roles for testing
      const usersWithDefaultRoles = (fallbackData || []).map((user, index) => ({
        ...user,
        role:
          user.role ||
          (index % 3 === 0
            ? 'manager'
            : index % 3 === 1
            ? 'supervisor'
            : 'housekeeper'),
      }));

      console.log(
        '🔍 Users with default roles assigned:',
        usersWithDefaultRoles,
      );
      return usersWithDefaultRoles;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVisibleUsers:', error);
    return [];
  }
};

// Send direct message between users
export const sendDirectMessage = async (
  senderId: string,
  receiverId: string,
  message: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();

    const messageData: ChatMessage = {
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
      message_type: 'direct',
      is_read: false,
      created_at: moment().valueOf(),
      updated_at: moment().valueOf(),
    };

    const {data: insertData, error} = await supabase
      .from('chat_messages')
      .insert([messageData]);

    if (error) {
      errorCallback(new Error('Failed to send message'));
      return;
    }
    successCallback(insertData);
  } catch (err) {
    errorCallback(err as Error);
  }
};

// Get messages between two users
export const getDirectMessages = async (
  user1Id: string,
  user2Id: string,
  limit: number = 50,
) => {
  try {
    const {data, error} = await supabase
      .from('chat_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`,
      )
      .eq('message_type', 'direct')
      .order('created_at', {ascending: true})
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDirectMessages:', error);
    return [];
  }
};

// Get user's chat conversations
export const getUserChats = async (userId: string) => {
  try {
    const {data, error} = await supabase
      .from('chat_messages')
      .select(
        `
        *,
        sender:sender_id(id, first_name, last_name, role),
        receiver:receiver_id(id, first_name, last_name, role)
      `,
      )
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('message_type', 'direct')
      .order('created_at', {ascending: false});

    if (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }

    // Group messages by conversation partner
    const conversations = new Map();

    data?.forEach(message => {
      const partnerId =
        message.sender_id === userId ? message.receiver_id : message.sender_id;
      const partner =
        message.sender_id === userId ? message.receiver : message.sender;

      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      if (message.receiver_id === userId && !message.is_read) {
        conversations.get(partnerId).unreadCount++;
      }
    });

    return Array.from(conversations.values());
  } catch (error) {
    console.error('Error in getUserChats:', error);
    return [];
  }
};

// Original support message function
export const sendMessage = async (
  data: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {data: insertData, error} = await supabase
      .from('chat_support')
      .insert([data]);
    if (error) {
      errorCallback(new Error('Failed to send message'));
      return;
    }
    successCallback(insertData);
  } catch (err) {
    errorCallback(err as Error);
  }
};
