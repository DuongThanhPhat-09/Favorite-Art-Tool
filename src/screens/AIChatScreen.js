import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
// SỬA LỖI: Sử dụng model "gemini-pro" ổn định và tương thích hơn
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const AIChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatSession = useRef(null);

  useEffect(() => {
    chatSession.current = model.startChat({ history: [] });
    setMessages([
      {
        id: "welcome-message",
        text: "Hello! I am your creative assistant. How can I help you with art today?",
        role: "model",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: "user",
    };

    const newMessages = [userMessage, ...messages];
    const messageToSend = inputText.trim();

    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await chatSession.current.sendMessage(messageToSend);
      const response = await result.response;
      const text = response.text();
      const aiMessage = {
        id: Date.now().toString() + "-ai",
        text: text,
        role: "model",
      };
      setMessages((prev) => [aiMessage, ...prev]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: Date.now().toString() + "-error",
        text: "Sorry, I encountered an error. Please try again.",
        role: "model",
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === "user"
          ? styles.userMessageContainer
          : styles.modelMessageContainer,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <FlatList
          inverted
          data={[...messages]}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.chatArea}
          contentContainerStyle={styles.listContentContainer}
        />

        {isLoading && (
          <View style={styles.typingIndicatorContainer}>
            <Text style={styles.typingText}>Assistant is typing...</Text>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about art..."
            placeholderTextColor="#888"
            multiline
          />
          <Pressable
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Ionicons
              name="arrow-up-circle"
              size={32}
              color={isLoading || !inputText.trim() ? "#B0B0B0" : "tomato"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  chatArea: { flex: 1 },
  listContentContainer: { paddingHorizontal: 10, paddingBottom: 10 },
  messageContainer: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userMessageContainer: { backgroundColor: "tomato", alignSelf: "flex-end" },
  modelMessageContainer: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    elevation: 1,
  },
  messageText: { fontSize: 16, color: "black" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: { marginLeft: 10 },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  typingText: { color: "#666", marginRight: 5 },
});

export default AIChatScreen;
