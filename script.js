// Import required libraries - you'll need to add these to your project
// You can use npm or include them via CDN
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");
const saveButton = document.querySelector('#save-button');

// State variables
let userMessage = null;
let isResponseGenerating = false;
let context = []; // Store conversation context

// API configuration
const API_KEY = "AIzaSyDTs7euH2MJs20MmhhoHK7YLd3VfgbKqlo"; // Your Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Vector database configuration - You'll need to set up one of these services
// Options include Pinecone, Weaviate, Qdrant, or Chroma
const VECTOR_DB_API_KEY = "pcsk_6M3td9_NF8g2cx6D4SvFM5DZiLiz3mFJyQJsMBN7o1TtfsAroQ1jE6FT1jc5xRLZQndhYV";
const VECTOR_DB_URL = "https://sample-movies-oittf8i.svc.aped-4627-b74a.pinecone.io";

// Initialize vector store for document embeddings
let documentEmbeddings = [];

// Function to preprocess and index your documents
async function initializeKnowledgeBase() {
  try {
    console.log("Initializing knowledge base...");
    // In a production environment, this would connect to your vector DB
    // For demonstration, we'll simulate having loaded embeddings
    documentEmbeddings = await fetchEmbeddings();
    console.log("Knowledge base initialized successfully");
  } catch (error) {
    console.error("Failed to initialize knowledge base:", error);
  }
}

// Simulated function to fetch embeddings from your vector database
// In production, this would make an API call to your vector DB
async function fetchEmbeddings() {
  // This is a placeholder for connecting to your actual vector DB
  return [
    // These would be actual document embeddings in production
    { id: "doc0", content: "...", embedding: [0.3, 0.4, 0.1] },
    { id: "doc1", content: "...", embedding: [0.3, 0.2, 0.3] },
    { id: "doc2", content: "...", embedding: [0.1, 0.2, 0.3] },
    { id: "doc3", content: "...", embedding: [0.2, 0.3, 0.4] },
    { id: "doc4", content: "...", embedding: [0.3, 0.4, 0.5] },
    { id: "doc5", content: "...", embedding: [0.1, 0.4, 0.5] },
    { id: "doc6", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc7", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc8", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc9", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc10", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc11", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc12", content: "..." , embedding: [0.3, 0.4, 0.1] },
    { id: "doc13", content: "..." , embedding: [0.3, 0.4, 0.1] },
  ];
}

// Function to encode text into embeddings
// In production, you'd use an embedding model API
async function getEmbedding(text) {
  // For demonstration purposes, we'll simulate a basic embedding
  // In production, replace with actual API call to get embeddings
  const fakeEmbedding = Array(128).fill(0).map(() => Math.random());
  return fakeEmbedding;
}

// Function to find relevant documents for a query
async function retrieveRelevantDocuments(query) {
  try {
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query);

    // Find most similar documents using cosine similarity
    // This is a simplified version - production would use your vector DB's search
    const scoredDocuments = documentEmbeddings.map(doc => {
      // Calculate cosine similarity (simplified for demonstration)
      const similarity = calculateCosineSimilarity(queryEmbedding, doc.embedding);
      return {
        content: doc.content,
        score: similarity
      };
    });

    // Sort by similarity score and get top results
    const topResults = scoredDocuments
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return topResults.map(doc => doc.content);
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return [];
  }
}

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vecA, vecB) {
  // This is a simplified version for demonstration
  // In production, use a proper vector math library
  return 0.5 + Math.random() * 0.5; // Simulated similarity score
}

// Function to generate a prompt with retrieved context
function generatePrompt(query, relevantDocs) {
  let prompt = "You are RapidRoutines AI, a helpful calisthenics and fitness assistant. You know everything about fitness which includes: Weight Loss & Fat Burning, Muscle Building & Strength Training, Nutrition & Diet Planning, Cardio vs. Strength Training, Recovery & Injury Prevention, and any form of fitness.";
  prompt += "Provide detailed, accurate information based on the following context:\n\n";

  // Add relevant documents as context
  if (relevantDocs && relevantDocs.length > 0) {
    prompt += "RELEVANT INFORMATION:\n";
    relevantDocs.forEach((doc, i) => {
      prompt += `[${i+1}] ${doc}\n\n`;
    });
  }

  // Add conversation history for context
  if (context.length > 0) {
    prompt += "CONVERSATION HISTORY:\n";
    context.slice(-4).forEach(msg => { // Include last 4 exchanges for context
      prompt += `${msg.role}: ${msg.content}\n`;
    });
  }

  // Add the current query
  prompt += `\nUser query: ${query}\n`;
  prompt += "Respond in a friendly, helpful manner with accurate information about calisthenics and fitness. Make the information not too long. If the information is not in the database, do not say it is not there, use the internet to help instead. Use bold text for important points and section headers. If someone greets you, just greet them with answering only their prompt. Ask a follow up question if the prompt from the user is to general. ";

  return prompt;
}

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const savedContext = localStorage.getItem("chat-context");

  // Restore conversation context if available
  if (savedContext) {
    try {
      context = JSON.parse(savedContext);
    } catch (e) {
      console.error("Error parsing saved context:", e);
      context = [];
    }
  }

  // Restore saved chats or show a welcome message
  if (chatContainer) {
    chatContainer.innerHTML = savedChats || '';
    document.body.classList.toggle("hide-header", savedChats);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom

    // Display a welcome message if no chats are found
    if (!savedChats) {
      displayWelcomeMessage();
    }
  } else {
    console.error("Chat container not found");
  }
};

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Pre-process the text to identify formatting elements
function parseFormattingElements(text) {
  // Create an array of segments with formatting information
  const segments = [];
  let currentIndex = 0;

  // Parse bold text marked with asterisks
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, match.index),
        bold: false
      });
    }

    // Add the bold text (without the ** markers)
    segments.push({
      text: match[1],
      bold: true
    });

    currentIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      bold: false
    });
  }

  // Handle line breaks
  const processedSegments = [];
  segments.forEach(segment => {
    if (segment.text.includes('\n')) {
      const lines = segment.text.split('\n');
      lines.forEach((line, i) => {
        processedSegments.push({
          text: line,
          bold: segment.bold
        });

        if (i < lines.length - 1) {
          processedSegments.push({
            text: '\n',
            bold: false,
            lineBreak: true
          });
        }
      });
    } else {
      processedSegments.push(segment);
    }
  });

  return processedSegments;
}

// Enhanced typing effect that handles formatting in real-time
const showEnhancedTypingEffect = (text, textElement, incomingMessageDiv) => {
  // Parse the formatting first
  const segments = parseFormattingElements(text);

  // Convert segments to a flat array of characters with formatting info
  const characters = [];
  segments.forEach(segment => {
    if (segment.lineBreak) {
      characters.push({ char: '<br>', bold: false, lineBreak: true });
    } else {
      for (const char of segment.text) {
        characters.push({ char, bold: segment.bold });
      }
    }
  });

  // Clear the text element
  textElement.innerHTML = '';

  // Set up variables for the typing effect
  let currentCharIndex = 0;
  let currentHTML = '';
  let inBoldSegment = false;

  // Speed up the typing effect
  const typingInterval = setInterval(() => {
    // Process multiple characters per interval for a faster effect
    for (let i = 0; i < 5; i++) { // Typing 5 characters at once for speed
      if (currentCharIndex >= characters.length) {
        clearInterval(typingInterval);
        isResponseGenerating = false;

        const icon = incomingMessageDiv.querySelector(".icon");
        if (icon) icon.classList.remove("hide");

        // Save to local storage
        localStorage.setItem("saved-chats", chatContainer.innerHTML);
        localStorage.setItem("chat-context", JSON.stringify(context));
        break;
      }

      const charInfo = characters[currentCharIndex];

      // Handle bold text formatting
      if (charInfo.bold && !inBoldSegment) {
        currentHTML += '<strong>';
        inBoldSegment = true;
      } else if (!charInfo.bold && inBoldSegment) {
        currentHTML += '</strong>';
        inBoldSegment = false;
      }

      // Handle line breaks
      if (charInfo.lineBreak) {
        currentHTML += '<br>';
      } else {
        currentHTML += charInfo.char;
      }

      currentCharIndex++;
    }

    // Close any open bold tag at the end
    if (inBoldSegment && currentCharIndex >= characters.length) {
      currentHTML += '</strong>';
    }

    // Update the text element with the current HTML
    textElement.innerHTML = currentHTML;

    // Hide the typing indicator
    const icon = incomingMessageDiv.querySelector(".icon");
    if (icon) icon.classList.add("hide");

    // Scroll to keep the latest text visible
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 20); // Much faster interval (20ms) for a smoother effect
};

// Fetch response from the API based on user message and retrieved context
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    // First, retrieve relevant documents
    const relevantDocs = await retrieveRelevantDocuments(userMessage);

    // Generate enhanced prompt with retrieved context
    const enhancedPrompt = generatePrompt(userMessage, relevantDocs);

    // Send request to Gemini API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: enhancedPrompt }]
        }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Failed to get response");

    // Get the API response text
    const apiResponse = data?.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";

    // Update conversation context
    context.push({ role: "user", content: userMessage });
    context.push({ role: "assistant", content: apiResponse });

    // Display response with enhanced typing effect
    showEnhancedTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    console.error("API response error:", error);
    isResponseGenerating = false;
    if (textElement) {
      textElement.innerText = "Sorry, I encountered an error. Please try again later.";
      textElement.parentElement.closest(".message").classList.add("error");
    }
  } finally {
    if (incomingMessageDiv) {
      incomingMessageDiv.classList.remove("loading");
    }
  }
};

// Show a placeholder message while waiting for the API response
const showPlaceholderMessage = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="logo.jpg" alt="">
                  <p class="text"></p>
                </div>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  if (chatContainer) {
    chatContainer.appendChild(incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    // Start API response generation immediately for faster response
    generateAPIResponse(incomingMessageDiv);
  } else {
    console.error("Chat container not found");
  }
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim();
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  if (chatContainer) {
    chatContainer.appendChild(outgoingMessageDiv);
    typingForm.reset(); // Clear input field
    document.body.classList.add("hide-header");
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Generate response immediately for faster perception
    showPlaceholderMessage();
  } else {
    console.error("Chat container not found");
  }
};

// Delete all chats from local storage when button is clicked
if (deleteChatButton) {
  deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
      localStorage.removeItem("saved-chats");
      localStorage.removeItem("chat-context");
      context = [];
      loadDataFromLocalstorage();
    }
  });
} else {
  console.error("Delete chat button not found");
}

// Prevent default form submission and handle outgoing chat
if (typingForm) {
  typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
  });
} else {
  console.error("Typing form not found");
}

// Get a random welcome message
const getRandomWelcomeMessage = () => {
  const welcomeMessages = [
    "Hi! Welcome to RapidRoutines AI. How can I help you today?",
    "Yo yo! RapidRoutines AI. How can I help?",
    "Yo what's up! This is RapidRoutines AI. Need some help creating a workout routine?",
  ];
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

// Display a welcome message with a typing effect
const displayWelcomeMessage = () => {
  const welcomeMessage = getRandomWelcomeMessage();
  const html = `<div class="message-content">
                  <img class="avatar" src="logo.jpg" alt="">
                  <p class="text"></p>
                </div>`;

  const welcomeMessageDiv = createMessageElement(html, "incoming");
  if (chatContainer) {
    chatContainer.appendChild(welcomeMessageDiv);
    const textElement = welcomeMessageDiv.querySelector(".text");
    showEnhancedTypingEffect(welcomeMessage, textElement, welcomeMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  } else {
    console.error("Chat container not found");
  }
};



// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await initializeKnowledgeBase();
    loadDataFromLocalstorage();
});
