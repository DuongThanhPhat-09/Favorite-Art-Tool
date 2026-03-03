import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Button,
  ActivityIndicator,
} from "react-native";
import { useFavorites } from "../context/FavoritesContext";
import { Ionicons } from "@expo/vector-icons";
import { Rating } from "react-native-ratings";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Toast from "react-native-toast-message";

const DetailScreen = ({ route, navigation }) => {
  const { artTool } = route.params;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const [suggestion, setSuggestion] = useState("");
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState(artTool.feedbacks || []);

  // --- START: LOGIC TÍNH GIÁ MỚI ---
  const hasDeal = artTool.limitedTimeDeal > 0;
  const originalPrice = parseFloat(artTool.price);
  const discountedPrice = hasDeal
    ? originalPrice * (1 - artTool.limitedTimeDeal)
    : originalPrice;
  // --- END: LOGIC TÍNH GIÁ MỚI ---

  const getGeminiSuggestion = async () => {
    setIsSuggestionLoading(true);
    setSuggestion("");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro
      const prompt = `Give me 3 short, creative, and inspiring ideas for what I can do with this art tool: "${artTool.artName}". Format the response with bullet points.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setSuggestion(text);
    } catch (e) {
      console.error(e);
      setSuggestion("Sorry, an error occurred while getting ideas.");
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite(artTool.id)) {
      removeFavorite(artTool.id);
      Toast.show({
        type: "info",
        text1: "Removed from Favorites",
      });
    } else {
      addFavorite(artTool);
      Toast.show({
        type: "success",
        text1: "Added to Favorites! ✨",
      });
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: artTool.artName });
  }, [navigation, artTool]);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: artTool.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.detailsContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{artTool.artName}</Text>
          <Pressable onPress={handleFavoriteToggle}>
            <Ionicons
              name={isFavorite(artTool.id) ? "heart" : "heart-outline"}
              size={32}
              color="tomato"
            />
          </Pressable>
        </View>
        <Text style={styles.brand}>Brand: {artTool.brand}</Text>

        {/* --- START: HIỂN THỊ GIÁ CÓ ĐIỀU KIỆN --- */}
        <View style={styles.priceContainer}>
          {hasDeal ? (
            <>
              <Text style={styles.discountedPrice}>
                ${discountedPrice.toFixed(2)}
              </Text>
              <Text style={styles.originalPrice}>
                ${originalPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.discountedPrice}>
              ${originalPrice.toFixed(2)}
            </Text>
          )}
        </View>
        {/* --- END: HIỂN THỊ GIÁ CÓ ĐIỀU KIỆN --- */}

        <Text style={styles.description}>{artTool.description}</Text>
      </View>

      <View style={styles.aiSection}>
        <Text style={styles.feedbackTitle}>AI Creative Corner</Text>
        <Button
          title="Get Creative Ideas!"
          onPress={getGeminiSuggestion}
          color="#6A0DAD"
        />
        {isSuggestionLoading && (
          <ActivityIndicator style={{ marginTop: 15 }} size="large" />
        )}
        {suggestion && (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        )}
      </View>

      <View style={styles.feedbackContainer}>
        <View style={styles.separator} />

        <Text style={styles.feedbackTitle}>What Others Say</Text>

        {feedbacks && feedbacks.length > 0 ? (
          feedbacks.map((fb, index) => (
            <View key={index} style={styles.feedbackItem}>
              <Text style={styles.author}>{fb.author}</Text>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={20}
                readonly
                startingValue={fb.rating}
                style={styles.rating}
              />
              <Text style={styles.comment}>"{fb.comment}"</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noFeedback}>No feedbacks yet. Be the first!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  image: { width: "100%", height: 300, backgroundColor: "#f0f0f0" },
  detailsContainer: { padding: 20 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: { fontSize: 22, fontWeight: "bold", flex: 1, marginRight: 10 },
  brand: { fontSize: 16, color: "#666", marginBottom: 8 },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "tomato",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: "#888",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  description: { fontSize: 16, lineHeight: 24 },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  aiSection: {
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  suggestionBox: {
    marginTop: 15,
    backgroundColor: "#f0e6ff",
    padding: 15,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  feedbackContainer: { padding: 20, paddingTop: 0 },
  feedbackTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  feedbackItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  author: { fontWeight: "bold" },
  rating: { alignItems: "flex-start", marginVertical: 5 },
  comment: { fontStyle: "italic", fontSize: 16 },
  noFeedback: { color: "#888" },
});

export default DetailScreen;
