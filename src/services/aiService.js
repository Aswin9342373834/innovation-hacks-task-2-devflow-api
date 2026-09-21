/**
 * AI Service for DevFlow AI
 * Primary provider: Google Gemini API (gemini-1.5-flash)
 * Resilient fallback: Domain-aware intelligent task synthesis engine
 */

/**
 * Clean and parse JSON response from LLM output (removes markdown backticks if present)
 */
const extractJsonFromText = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    // Attempt markdown code block stripping
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

/**
 * Intelligent domain-aware fallback task generator.
 * Used when AI_API_KEY is not configured or when external API request fails.
 */
const generateFallbackTasks = (prompt) => {
  const lower = prompt.toLowerCase();

  const isEcommerce = lower.includes('shop') || lower.includes('store') || lower.includes('commerce') || lower.includes('cart');
  const isMobile = lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('app');
  const isAi = lower.includes('ai') || lower.includes('machine learning') || lower.includes('llm') || lower.includes('model');
  const isAuth = lower.includes('auth') || lower.includes('login') || lower.includes('jwt') || lower.includes('signup');
  const isDevOps = lower.includes('deploy') || lower.includes('cloud') || lower.includes('docker') || lower.includes('ci/cd') || lower.includes('render');

  let tasks = [];

  if (isEcommerce) {
    tasks = [
      {
        title: 'Design Database Schemas for Catalog & Orders',
        description: 'Set up MongoDB schemas for Products, Categories, Shopping Carts, and Customer Orders with indexes.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 6
      },
      {
        title: 'Implement Product Browsing & Search Filters',
        description: 'Create responsive product grid with category filtering, price range, and fuzzy text search.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 8
      },
      {
        title: 'Build Shopping Cart & State Management',
        description: 'Implement persistent cart drawer, item counter, quantity controls, and subtotal calculation.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Integrate Payment Gateway & Checkout Flow',
        description: 'Implement Stripe/PayPal checkout flow with address validation and webhooks.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 10
      },
      {
        title: 'Order Confirmation & Email Receipts',
        description: 'Set up automated transactional email delivery for order confirmations and tracking links.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 4
      },
      {
        title: 'End-to-End Checkout Testing & Security Audit',
        description: 'Run automated integration tests for cart edge cases and conduct security review of checkout routes.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 6
      }
    ];
  } else if (isMobile) {
    tasks = [
      {
        title: 'Initialize Mobile App Architecture & Navigation',
        description: 'Configure React Native / Flutter workspace, tab navigation stack, and base UI theme.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 6
      },
      {
        title: 'Design Responsive Mobile Screens & Components',
        description: 'Create touch-friendly UI components with fluid layouts, safe-area insets, and dark mode support.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 8
      },
      {
        title: 'Integrate REST API Client & Offline Storage',
        description: 'Connect mobile views to backend REST endpoints with offline async caching and retry logic.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 7
      },
      {
        title: 'Configure Push Notifications & Deep Linking',
        description: 'Set up Firebase Cloud Messaging (FCM) and routing for in-app push notifications.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Device Testing & App Store Release Preparation',
        description: 'Conduct real device testing on iOS/Android, configure app icons, splash screen, and release builds.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 6
      }
    ];
  } else if (isAi) {
    tasks = [
      {
        title: 'Define Prompt Engineering Templates & Guardrails',
        description: 'Establish structured system prompts, output schemas, and error boundaries for LLM completions.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Build Backend AI Controller & Rate Limiting',
        description: 'Implement secure server-side API proxy with API key encapsulation and request throttling.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 6
      },
      {
        title: 'Design Interactive AI Workspace & Preview UI',
        description: 'Create user interface with prompt input, streaming status indicators, and editable output review.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 8
      },
      {
        title: 'Implement Local Fallback & Offline Resilience',
        description: 'Add deterministic fallback logic when upstream AI services experience downtime or quota limits.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 4
      },
      {
        title: 'Conduct Performance Benchmarking & Output Validation',
        description: 'Evaluate latency, token consumption, and response accuracy across test prompt benchmarks.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 4
      }
    ];
  } else if (isAuth) {
    tasks = [
      {
        title: 'Configure Password Hashing with Bcrypt',
        description: 'Implement secure cryptographic salt rounds and password hashing logic on user registration.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 4
      },
      {
        title: 'Implement JWT Token Issuance & Verification',
        description: 'Set up signed JSON Web Tokens, Bearer headers, and authentication middleware.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Build Login & Registration Frontend Forms',
        description: 'Create responsive auth forms with client-side validation and toast notifications.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 6
      },
      {
        title: 'Implement Route Protection & Auth State Persistence',
        description: 'Create React Context, localStorage token synchronization, and protected route wrappers.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Write Automated Security & Auth Test Cases',
        description: 'Test credential rejection, expired tokens, and access denial for unauthorized resources.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 4
      }
    ];
  } else if (isDevOps) {
    tasks = [
      {
        title: 'Configure Production Environment Variables & Secrets',
        description: 'Set up secure configuration templates, .env.example files, and host environment values.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 3
      },
      {
        title: 'Set Up Continuous Integration & Test Pipelines',
        description: 'Configure automated test execution and code quality linter checks on every pull request.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Configure Cloud Web Service & Deployment Webhooks',
        description: 'Link Git repository to Render/Vercel platform with automatic deploy triggers on main branch.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 4
      },
      {
        title: 'Configure Health Check & Monitoring Endpoints',
        description: 'Implement ping and DB connection status checks for uptime monitor integration.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 3
      }
    ];
  } else {
    // General software project tasks
    tasks = [
      {
        title: `Design Architecture & Project Structure for: ${prompt.slice(0, 50)}`,
        description: `Set up the foundational workspace, environment configurations, and dependency architecture for ${prompt}.`,
        priority: 'high',
        status: 'todo',
        estimatedHours: 4
      },
      {
        title: 'Implement Core Data Models & Schemas',
        description: 'Define database schemas, relationships, constraints, and validation rules for business entities.',
        priority: 'high',
        status: 'todo',
        estimatedHours: 6
      },
      {
        title: 'Build RESTful API Services & Business Logic',
        description: 'Implement CRUD controllers, route handlers, error middleware, and input validation.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 8
      },
      {
        title: 'Develop Responsive User Interface Views',
        description: 'Construct interactive dashboards, reusable components, loading states, and notification toasts.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 8
      },
      {
        title: 'Implement Automated Unit & Integration Tests',
        description: 'Write automated test suites verifying API responses, database operations, and user workflows.',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 5
      },
      {
        title: 'Deploy to Cloud Infrastructure & Verify Production',
        description: 'Configure cloud hosting, environment variables, health check endpoints, and CORS origins.',
        priority: 'low',
        status: 'todo',
        estimatedHours: 4
      }
    ];
  }

  return tasks;
};

/**
 * Generate 4-8 development tasks from a project goal using Google Gemini
 */
const generateTasksWithGemini = async (prompt) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Graceful fallback when key is not configured
    return {
      provider: 'DevFlow Smart Engine (Fallback)',
      tasks: generateFallbackTasks(prompt)
    };
  }

  const systemInstruction = `You are DevFlow AI, an expert software engineering project manager.
The user will provide a project goal or feature description.
Generate between 4 and 8 concrete, sequential development tasks.
Respond with ONLY a raw JSON array of objects. Do not include markdown commentary, intro, or outro.
Each object in the array must strictly have these fields:
- "title": (string) concise action-oriented task title (max 100 characters)
- "description": (string) practical description of what needs to be built or configured
- "priority": (string) one of: "low", "medium", "high"
- "status": (string) "todo"
- "estimatedHours": (number) estimated hours to complete (1-20)
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nProject Goal: "${prompt}"` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn(`[AI Service] Gemini API returned status ${response.status}. Using fallback.`);
      return {
        provider: 'DevFlow Smart Engine (Fallback - API Error)',
        tasks: generateFallbackTasks(prompt)
      };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        provider: 'DevFlow Smart Engine (Fallback)',
        tasks: generateFallbackTasks(prompt)
      };
    }

    const parsedTasks = extractJsonFromText(rawText);

    if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
      const sanitizedTasks = parsedTasks.slice(0, 8).map((t, idx) => ({
        title: String(t.title || `Task ${idx + 1}`).trim().slice(0, 150),
        description: String(t.description || '').trim().slice(0, 500),
        priority: ['low', 'medium', 'high'].includes(t.priority?.toLowerCase())
          ? t.priority.toLowerCase()
          : 'medium',
        status: 'todo',
        estimatedHours: typeof t.estimatedHours === 'number' ? t.estimatedHours : 4
      }));

      return {
        provider: 'Google Gemini (gemini-1.5-flash)',
        tasks: sanitizedTasks
      };
    }

    return {
      provider: 'DevFlow Smart Engine (Fallback)',
      tasks: generateFallbackTasks(prompt)
    };
  } catch (error) {
    console.warn('[AI Service] Gemini request exception:', error.message, '. Using fallback.');
    return {
      provider: 'DevFlow Smart Engine (Fallback)',
      tasks: generateFallbackTasks(prompt)
    };
  }
};

/**
 * Generate AI Productivity Suggestions based on existing tasks
 */
const generateProductivitySuggestions = (tasks = [], projectName = 'All Projects') => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  const unassigned = tasks.filter((t) => !t.assignedTo && t.status !== 'done');

  const suggestions = [];

  if (highPriority.length > 0) {
    suggestions.push({
      type: 'high_priority',
      badge: 'Immediate Focus',
      title: `${highPriority.length} High-Priority Task${highPriority.length > 1 ? 's' : ''} Pending`,
      description: `Focus on "${highPriority[0].title}" first to unblock downstream milestones.`,
      action: 'Prioritize'
    });
  }

  if (inProgress > 3) {
    suggestions.push({
      type: 'wip_limit',
      badge: 'WIP Limit Warning',
      title: `${inProgress} Tasks Currently In Progress`,
      description: 'You have multiple tasks in flight. Consider finishing current tasks before picking up new items.',
      action: 'Review WIP'
    });
  } else if (inProgress === 0 && todo > 0) {
    suggestions.push({
      type: 'momentum',
      badge: 'Action Item',
      title: 'No Tasks Currently In Progress',
      description: `Pick up "${tasks.find((t) => t.status === 'todo')?.title || 'a pending task'}" to keep sprint momentum moving.`,
      action: 'Start Task'
    });
  }

  if (unassigned.length > 0) {
    suggestions.push({
      type: 'assignment',
      badge: 'Ownership',
      title: `${unassigned.length} Unassigned Active Task${unassigned.length > 1 ? 's' : ''}`,
      description: 'Tasks without assignees run a higher risk of being overlooked. Assign team members to ensure accountability.',
      action: 'Assign'
    });
  }

  suggestions.push({
    type: 'summary',
    badge: 'Velocity',
    title: `Sprint Progress: ${total > 0 ? Math.round((done / total) * 100) : 0}% Complete`,
    description: `${done} of ${total} tasks completed. ${todo} in backlog and ${inProgress} in progress for ${projectName}.`,
    action: 'View All'
  });

  return {
    projectName,
    metrics: {
      total,
      done,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      highPriorityPending: highPriority.length,
      unassignedCount: unassigned.length
    },
    suggestions
  };
};

module.exports = {
  generateTasksWithGemini,
  generateFallbackTasks,
  generateProductivitySuggestions
};
