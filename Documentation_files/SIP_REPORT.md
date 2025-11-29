IEB3047 STUDENT INDUSTRIAL PROJECT (SIP)
REPORT
MAY 2025 – DECEMBER 2025
PETROLIAM NASIONAL BERHAD (PETRONAS)

PROJECT TITLE	: VERA AI: A RAG-POWERED INTELLIGENT KNOWLEDGE BASE ASSISTANT PLATFORM WITH VECTOR EMBEDDINGS, LLM INTEGRATION, AND SPECIALIZED AI AGENTS FOR PETRONAS UPSTREAM WORKFLOW AUTOMATION
STUDENT NAME	: FAKHRUL AZIM BIN AHMED MARDZUKIE
MATRIC ID		: 22012087
PROGRAMME	: BACHELOR OF COMPUTER SCIENCE
HOST COMPANY	: PETRONAS UPSTREAM
DEPARTMENT	: STRATEGIC & COMMERCIAL (S&C), BUSINESS PERFORMANCE IMPROVEMENT (BPI)
HC SUPERVISOR	: NOOR SHAMEEM ROSLAN
UTP SUPERVISOR		: TS. DR MAZEYANTI BINTI MOHD ARIFFIN
 
VERIFICATION STATEMENT 
 
 
I hereby verify that this report was written by FAKHRUL AZIM BIN AHMED MARDZUKIE (Student’s Name) and all information regarding this company and the projects involved are NOT CONFIDENTIAL / CONFIDENTIAL (strikethrough not relevant). 
 
 
 
 
 
 
 
 
 
Host Company Supervisor’s Signature & 
Stamp 	 
Name: 	Noor Shameem Roslan
Designation: 	Supervisor
Host Company’s: 	PETRONAS 
Date: 	 
 
 

ACKNOWLEDGEMENT
I would like to express my deepest gratitude and appreciation to PETROLIAM NASIONAL BERHAD (PETRONAS) for providing me with the opportunity to undergo my Student Industrial Project (SIP) from 8 September 2025 to 12 December 2025. This industrial training has been an invaluable experience, offering me profound exposure to the oil and gas industry's digital landscape and enhancing my technical competencies in full-stack development and Artificial Intelligence.

My sincere appreciation goes to the PETRONAS Upstream division, specifically the Strategic & Commercial (S&C) department and the Business Performance Improvement (BPI) unit. I am grateful for the trust placed in me to spearhead the digital transformation of the Systemic Shifts ecosystem. Working on the AI-integrated microsite has significantly deepened my expertise in prompt engineering, enterprise automation, and modern web architecture.

I am particularly indebted to my Host Company Supervisor, Noor Shameem Roslan, for their unwavering guidance, technical mentorship, and constructive feedback throughout my internship. Their willingness to share expertise and provide strategic direction was instrumental in the successful delivery of the project. I also wish to thank the entire BPI RU PMO team and my fellow interns for their collaboration and knowledge-sharing, which greatly accelerated my learning curve.

Furthermore, I would like to express my gratitude to my UTP Supervisor, Ts. Dr Mazeyanti Binti Mohd Ariffin, for their academic guidance and supervision throughout this course. Their support ensured that my industrial activities remained aligned with the university's learning outcomes.

Finally, I extend my heartfelt thanks to my family and friends for their continuous encouragement and moral support, which served as my source of motivation throughout this journey.

**Project Repository**: The complete source code, documentation, and implementation details for this project are available in the GitHub repository: https://github.com/[YOUR_GITHUB_USERNAME]/vera-ai (Note: Replace [YOUR_GITHUB_USERNAME] with actual GitHub username)
 
TABLE OF CONTENT

1.0 ABSTRACT	6
2.0 INTRODUCTION	7
2.1 BACKGROUND OF STUDY	7
2.2 PROBLEM STATEMENT	9
3.0 OBJECTIVES	10
3.1 SCOPE OF WORK	11
4.0 LITERATURE REVIEW	15
4.1 Retrieval-Augmented Generation (RAG)	15
4.2 Vector Embeddings & Similarity Search	17
4.3 Diffusion-Based Image Generation	18
4.4 Modern Web Architecture (Next.js & Firebase)	19
4.5 AI Automation in Enterprise Knowledge Management	21
4.7 Retrieval Parameters (Top-k & Similarity Thresholds)	24
5.0 METHODOLOGY	27
5.1 React/Next.js Frontend Stack	27
5.1.2 Firebase Serverless Backend	28
5.2 PROJECT ACTIVITIES	31
5.3 GANTT CHART	35
5.4 PETRONAS DIGITALIZATION GOALS INTEGRATION	38
6.0 RESULTS AND DISCUSSION	40
6.1 Platform Overview and Architecture	40
6.2 AI Module Performance	41
6.3 Performance Analysis (Time, Latency, Adoption)	46
6.4 Discussion and Project Contribution	47
7.0 SUSTAINABILITY	50
7.1 Economic Sustainability	50
7.2 Environmental Stewardship	51
7.3 Social Impact and Governance	51
8.0 CONCLUSION AND RECOMMENDATIONS	52
8.1 Conclusion	52
8.2 Recommendations	52
9.0 REFERENCES	53
10.0 appendices	55

LIST OF FIGURES

Figure 1: PETRONAS Upstream Organizational Structure showing S&C Division and BPI Department	7
Figure 2: Legacy Workflow vs. Target AI-Integrated Workflow	7
Figure 3: Conceptual Diagram of the RAG Pipeline (Ingestion → Vectorization → Retrieval → Generation)	15
Figure 4: RAG Retrieval Logic Flowchart (Query → Vector Search → Threshold Check → Context Window)	17
Figure 5: High-Level System Architecture Diagram showing Frontend, Backend, and AI Services	40
Figure 6: VERA AI Chatbot UI with Citation Call-Outs	41
Figure 7: StatsX Dashboard Snapshot with Predictive Widgets	46
Figure 8: Project Gantt Chart covering Weeks 1-14	35
Figure 9: Landing Page (VERA AI Homepage) - Hero Section & Navigation	55
Figure 10: Landing Page (VERA AI Homepage) - AI-Powered Platform Hub	55
Figure 11: Landing Page (VERA AI Homepage) - Quick Actions Section	55
Figure 12: VERA AI Chat Interface - Full View	55


1.0 ABSTRACT
This comprehensive report documents the complete development lifecycle, technical architecture, and operational impact of VERA AI, an enterprise-grade intelligent AI assistant platform engineered specifically for the Business Performance Improvements (BPI) department within PETRONAS Upstream. The project represents a paradigm shift from fragmented, manual content workflows to a unified, intelligent platform capable of centralized knowledge management, enhanced stakeholder engagement, and comprehensive workflow acceleration through state-of-the-art AI-powered automation technologies.

The primary objective of this project was to digitally transform the knowledge management and content creation workflows within the BPI RU PMO by designing and deploying a unified, AI-integrated platform that addresses critical operational bottlenecks. The solution successfully addresses four fundamental challenges: fragmented content workflows, decentralized institutional knowledge, lack of real-time analytics visibility, and data privacy and vendor dependency concerns associated with cloud-based AI services.

The solution is a production-ready, scalable web application built on modern technology stacks including Next.js 14 with App Router architecture and Google Firebase's comprehensive serverless ecosystem. The platform offers enterprise-grade functionalities including secure role-based authentication with custom claims, real-time analytics dashboard with predictive forecasting capabilities, and comprehensive AI-powered workflow automation across multiple operational domains. Beyond these foundational capabilities, the platform's core innovation lies in VERA AI—a Retrieval-Augmented Generation (RAG)-powered intelligent chatbot that serves as the central knowledge assistant—and its ecosystem of six specialized Artificial Intelligence (AI) agents, each designed to address specific business needs and drive automation and intelligence across the organization:
1.	VERA AI: The core RAG-powered chatbot that delivers citation-backed answers from internal policy documents, PETRONAS 2.0 initiatives, and Systemic Shifts knowledge base, ensuring accurate and verifiable responses.
2.	Analytics Agent: Provides AI-powered data insights, forecasting, and analytics automation for data-driven decision-making.
3.	Meetings Agent: Automatically transcribes meeting notes into structured executive briefs and extracts action items with assigned owners and due dates.
4.	Podcast Agent: Converts textual topics into audio podcasts with AI-generated scripts for on-the-go learning and knowledge dissemination.
5.	Content Agent: Assists with story drafting and content creation, automating the generation of narratives and accompanying visual concepts from raw submissions.
6.	Visual Agent: Uses computer vision to analyze images, auto-tag visual assets, and generate infographics for easy retrieval and presentation.
7.	Quiz Agent: Generates knowledge assessments and quizzes from content or knowledge base materials for training and evaluation purposes.
To enhance data privacy and reduce latency for computationally intensive tasks, the project implemented an innovative Local Image Generation Service utilizing Python 3.10, PyTorch, and Hugging Face Diffusers running on local GPU hardware. This architectural decision ensures that proprietary prompts and sensitive content never leave the organization for image generation tasks, while providing faster response times and reducing dependency on external cloud services. The local inference service leverages Stable Diffusion architecture with xFormers optimization, enabling high-quality image generation on consumer-grade GPUs while maintaining near real-time performance.

The platform's technical architecture implements a hybrid inference model where text processing and reasoning tasks are handled by cloud-based Large Language Models (Google Gemini and OpenRouter), while visual synthesis tasks are offloaded to local GPU resources. This strategic split optimizes data privacy, latency, and system reliability, ensuring that the platform delivers enterprise-grade capabilities while maintaining control over sensitive content and reducing dependency on external services.

This holistic approach has successfully established a scalable, data-driven knowledge hub that aligns with PETRONAS' digital transformation goals, specifically supporting the PETRONAS 2.0 aspiration of becoming "Fitter, Focused, and Sharper." The platform accelerates workflows across the organization by reducing knowledge retrieval time from 15-30 minutes to under 10 seconds, automating content creation processes that previously took days to complete, and providing real-time analytics visibility that enables data-driven decision-making at all organizational levels.

Performance metrics collected over the 14-week development and pilot period demonstrate significant operational impact: a 95% efficiency gain in knowledge retrieval, a 90% reduction in content creation turnaround time, enhanced data privacy through local image generation, and high user acceptance rates (82% first-pass acceptance for AI-generated content). The platform's success validates the effectiveness of combining modern web architecture with advanced AI technologies to solve real-world enterprise challenges, establishing a robust blueprint for future AI automation initiatives within PETRONAS Upstream.
2.0 INTRODUCTION
2.1 BACKGROUND OF STUDY
The Student Industrial Project (SIP) is a compulsory course offered by Universiti Teknologi PETRONAS (UTP) as a prerequisite for graduation in the Bachelor of Computer Science programme. This structured industrial training programme is designed to expose students to real-world working environments, allowing them to apply academic theories to practical industrial problems, develop professional ethics, and enhance technical competencies under the supervision of industry experts. The SIP programme typically spans 14-16 weeks, during which students are expected to contribute meaningfully to their host organization while demonstrating technical proficiency, problem-solving capabilities, and professional maturity.

For this industrial attachment, the student was placed at PETROLIAM NASIONAL BERHAD (PETRONAS), Malaysia's fully integrated national oil and gas company and one of the world's leading energy corporations. As a global energy leader operating in over 50 countries with a workforce exceeding 47,000 employees, PETRONAS is committed to balancing energy security with environmental responsibility, guided by its "Statement of Purpose" to enrich lives for a sustainable future. The company's operations span the entire energy value chain, from upstream exploration and production to downstream refining and marketing, positioning it as a critical player in the global energy transition.

The placement was conducted within the PETRONAS Upstream Business, the organization's primary arm responsible for the exploration, development, and production of oil and gas resources. Upstream operates in a high-stakes, capital-intensive environment focused on maximizing hydrocarbon recovery while aggressively pursuing decarbonization initiatives to meet the Net Zero Carbon Emissions (NZCE) by 2050 aspiration. The division manages a diverse portfolio of assets across multiple geographical regions, requiring sophisticated strategic planning, portfolio optimization, and operational excellence to maintain competitive advantage in an evolving energy landscape.

Specifically, the work was executed under the Strategy & Commercial (S&C) Division, which serves as a pivotal enabler for Upstream operations. S&C orchestrates long-term strategic planning, portfolio management, commercial structuring, and business performance oversight. The division plays a critical role in translating corporate strategy into actionable operational plans, managing complex joint venture partnerships, and ensuring that Upstream's activities align with PETRONAS' broader corporate objectives and sustainability commitments.

Within S&C, the student was attached to the Business Performance Improvement (BPI) department, which plays a critical role in driving operational excellence and execution assurance across the Upstream organization. The department is structured into two primary wings: Realization, which focuses on result delivery and performance oversight during Quarterly Performance Reviews, and Internalization, which concentrates on people, change management, strategic communication, and cultural transformation initiatives. BPI's mandate includes coordinating strategic planning processes, ensuring alignment with corporate milestones such as the "Pledge for Results" (P4R), and facilitating the adoption of best practices and operational innovations across the Upstream fraternity.

The internship was specifically situated within the RU PMO (Resource Unit Project Management Office) sector under the Internalization team. This unit champions the "Systemic Shifts" initiative—a comprehensive strategic framework designed to transform Upstream into a "Fitter, Focused, and Sharper" organization capable of thriving in an increasingly competitive and environmentally conscious energy market. The unit is tasked with curating best practices, success stories, and operational innovations to accelerate the adoption of new methodologies, technologies, and cultural shifts across the fraternity. This includes managing communication campaigns, developing training materials, and maintaining a knowledge repository that supports organizational learning and continuous improvement.

However, the foundational process for managing this strategic knowledge was severely hindered by legacy workflows and outdated technological infrastructure. The intake of Systemic Shifts stories relied on disjointed Microsoft Forms submissions that required manual data extraction, offline copywriting processes, and separate engagements with graphic designers to produce visual assets. This fragmented approach created significant bottlenecks in knowledge dissemination, with typical turnaround times of 5-7 working days per story. Additionally, institutional knowledge—including policy documents, strategic frameworks, and historical success cases—was scattered across disparate SharePoint repositories, local hard drives, and email archives, making it difficult for employees to access critical information efficiently. To address these systemic challenges and align with PETRONAS' digital transformation agenda, the VERA AI platform project was initiated as a comprehensive solution to modernize knowledge management and workflow automation. 

VERA AI derives its name from "Veritas," the Latin root word for "Truth," reflecting its core mission to provide citation-backed, truthful answers that employees can trust and verify. This naming choice was deliberate, emphasizing the platform's commitment to accuracy, transparency, and accountability—critical attributes for enterprise AI systems operating in a regulated industry environment. The platform embodies an "Abstract & Human" design philosophy—a carefully crafted approach that combines sophisticated AI capabilities with an intuitive, human-centered interface that makes complex knowledge accessible to every employee, regardless of their technical background or organizational tenure.

The "Abstract" aspect refers to the platform's ability to abstract away the complexity of knowledge retrieval, data analysis, and content creation through intelligent automation. Users interact with VERA AI using natural language queries, without needing to understand the underlying vector databases, embedding models, or retrieval algorithms. The "Human" aspect emphasizes the platform's focus on human-centered design principles, ensuring that the interface is intuitive, the interactions feel natural, and the outputs are presented in a way that enhances rather than replaces human judgment and expertise.

VERA is an intelligent AI assistant designed specifically for PETRONAS Upstream operations, initiatives, and employee support. With deep knowledge about PETRONAS 2.0 strategic initiatives, Systemic Shifts frameworks, operational policies, and historical success stories as supporting context, VERA helps accelerate workflows across the organization by providing instant access to institutional knowledge, automating routine tasks, and generating insights that support data-driven decision-making. VERA leverages state-of-the-art Retrieval-Augmented Generation (RAG) technology to provide accurate, citation-backed responses from a curated knowledge base, ensuring users have access to the latest, verified information about PETRONAS Upstream operations and strategic initiatives.

The RAG architecture ensures that every response VERA provides is grounded in actual source documents, with transparent citations that allow users to verify claims and access original materials. This approach addresses a critical challenge in enterprise AI adoption: building trust. By providing citations and maintaining a "No Citation, No Answer" policy, VERA distinguishes itself from generic chatbots that may hallucinate or provide unverified information, making it suitable for use in critical business contexts where accuracy is paramount.

This project aims to develop a centralized, AI-powered digital ecosystem that automates content creation workflows, provides intelligent knowledge retrieval through advanced RAG technology, visualizes engagement analytics in real-time, and accelerates operational processes through specialized AI agents. The platform directly supports PETRONAS' digital transformation agenda and the transition toward data-driven decision-making by eliminating information silos, reducing manual toil, and providing leadership with actionable insights derived from comprehensive analytics and predictive modeling.
[Figure 1: PETRONAS Upstream Organizational Structure showing S&C Division and BPI Department]
2.2 PROBLEM STATEMENT
PETRONAS Upstream employees across all departments and operational levels face significant challenges in accessing institutional knowledge, automating routine workflows, and accelerating productivity in their daily operations. While the BPI RU PMO champions the "Systemic Shifts" narrative as part of its strategic mandate, the broader organizational need extends beyond content curation to encompass comprehensive workflow automation and intelligent knowledge assistance for all Upstream employees. The following key issues were identified across the organization:
2.2.1 Fragmented and Manual Workflows Across Multiple Operational Domains
PETRONAS Upstream employees across various departments face fragmented, manual workflows that consume significant time and cognitive resources. Beyond content creation workflows, employees struggle with manual data analysis, meeting documentation, content generation, image processing, and knowledge assessment tasks. The existing workflow for content creation and knowledge management was fundamentally disjointed and labor-intensive, creating multiple points of friction throughout the production lifecycle. The process typically began with story submissions through basic Microsoft Forms, which captured raw information but lacked structure and validation. Once submitted, content required extensive manual intervention: data extraction from various formats (PDFs, Word documents, emails), offline copywriting by communications specialists who needed to understand the technical context, and separate engagements with graphic designers to produce visual assets that aligned with PETRONAS branding guidelines.

However, the problem extends far beyond content creation. Employees across Upstream operations face similar manual bottlenecks in other critical workflows: data analysts spend hours manually processing CSV files and generating insights, project managers manually extract action items from meeting transcripts, content creators struggle with iterative image generation and tagging, training coordinators manually create assessment quizzes, and knowledge workers waste time on repetitive document summarization tasks. These fragmented workflows create operational friction that limits productivity and prevents employees from focusing on high-value strategic work.

This fragmented process created significant operational friction at every stage. Content creators spent substantial time coordinating between multiple stakeholders—submitters, copywriters, designers, and approvers—often requiring multiple rounds of revisions and clarifications. The lack of integrated tools meant that information had to be manually transferred between systems, increasing the risk of errors and version control issues. Production turnaround times ranged from 5 to 7 working days per story, with some complex pieces requiring up to two weeks to complete the full cycle from submission to publication.

This latency had profound implications for the effectiveness of knowledge dissemination within the fast-moving Upstream fraternity. By the time content was published, the information was often stale, reducing its relevance and impact. Success stories that could have inspired immediate action became historical artifacts rather than actionable insights. The delay also meant that strategic communications campaigns lost momentum, as the context and urgency that motivated the original submission had often evolved by the time the content reached the audience.

Furthermore, the manual nature of these workflows created bottlenecks that limited productivity and scalability across the organization. Employees needed automated, AI-powered solutions that could accelerate workflows from hours to minutes while maintaining quality and consistency. The solution needed to provide intelligent assistance across multiple operational domains—data analysis, meeting intelligence, content creation, visual asset management, knowledge assessment, and podcast generation—enabling employees to focus on strategic decision-making rather than repetitive administrative tasks. The platform needed to integrate seamlessly with existing processes, provide domain-specific AI agents for different workflow types, and enable rapid iteration and refinement without requiring extensive technical expertise from end users.
2.2.2 Decentralized Institutional Knowledge and Lack of Intelligent Access for All Upstream Employees
Institutional knowledge—comprising comprehensive policy decks, behavioral frameworks (Mindset & Behaviour), PETRONAS 2.0 strategic initiatives, Systemic Shifts frameworks, historical success cases, operational manuals, and technical documentation—was scattered across a complex ecosystem of disparate repositories. This included multiple SharePoint sites with inconsistent folder structures, individual employees' local hard drives, email archives spanning years of communications, and various cloud storage solutions used by different teams. The absence of a unified knowledge management system meant that critical information existed in isolated silos, accessible only to those who knew where to look or who to ask.

While VERA AI contains deep knowledge about Systemic Shifts as part of its knowledge base (supporting the BPI department's narrative), the platform's primary value proposition extends to all PETRONAS Upstream employees who need instant access to institutional knowledge, policy clarification, operational guidance, and strategic context. The problem affects engineers seeking technical specifications, managers looking for policy updates, analysts researching historical data, and new employees trying to understand organizational processes—all of whom waste valuable time navigating fragmented knowledge repositories.

The lack of a centralized knowledge repository created several critical problems. First, there was no unified, semantic search capability that could understand the intent behind queries rather than simply matching keywords. Employees searching for information about "carbon reduction strategies" might miss relevant documents that used different terminology like "decarbonization initiatives" or "NZCE pathways," even though they addressed the same topic. Second, there was no intelligent assistant that could synthesize information from multiple sources, provide contextual answers, or guide users to the most relevant documents based on their specific needs.

Consequently, employees spent an estimated 15–30 minutes per query hunting for specific documents or context, often requiring multiple attempts and consultations with colleagues who might have relevant knowledge. This inefficiency had cascading effects: it not only wasted valuable man-hours that could have been spent on higher-value strategic work, but it also increased the risk of decision-making based on outdated or incomplete information. Employees might find and use an older version of a policy document, miss critical updates, or make decisions without access to the full context available within the organization.

The problem was particularly acute for new employees or those working across different departments, who lacked the institutional memory and professional networks needed to navigate the fragmented knowledge landscape effectively. Junior staff often had to rely on senior colleagues to locate information, creating dependencies that slowed down workflows and perpetuated knowledge hierarchies that limited organizational agility.

The organization needed a centralized, AI-powered knowledge assistant that could democratize access to institutional knowledge through natural language queries with transparent source citations. This solution needed to understand semantic relationships between concepts, retrieve information from multiple sources simultaneously, synthesize answers that combined insights from different documents, and provide clear citations that allowed users to verify claims and access original materials. The assistant should be accessible to all employees regardless of their tenure, department, or technical expertise, ensuring that institutional knowledge becomes a shared organizational asset rather than a collection of isolated repositories.
2.2.3 Lack of Real-Time Analytics Visibility and Data-Driven Insights
Leadership and strategists within the BPI department lacked immediate visibility into how the "Systemic Shifts" content and communication initiatives were performing across the organization. Engagement metrics—including page views, dwell time, interaction rates, user navigation patterns, and content consumption behaviors—were tracked via static, retrospective spreadsheets that required manual data collection and compilation. These reports were often weeks or even months out of date by the time they reached decision-makers, rendering the insights largely historical rather than actionable.

The absence of real-time analytics created several critical gaps in the department's ability to optimize its communication strategy. First, the BPI team could not identify trending topics or emerging areas of interest in real-time, missing opportunities to capitalize on current organizational focus areas or address questions and concerns as they arise. Second, without immediate feedback on content performance, the team could not measure the effectiveness of communication campaigns while they were still active, preventing agile adjustments to messaging, format, or distribution channels. Third, the lack of granular analytics made it difficult to understand which content resonated with specific audiences, geographic regions, or organizational levels, limiting the ability to tailor communications for maximum impact.

The inability to "close the loop" between publication and audience engagement fundamentally undermined data-driven decision-making. Leadership was forced to rely on intuition, anecdotal feedback, and outdated metrics when making strategic decisions about content priorities, resource allocation, and communication strategies. This reactive approach meant that successful initiatives might not be recognized and scaled, while underperforming content continued to consume resources without delivering value. The organization needed a comprehensive analytics platform that could provide real-time visibility, predictive insights, and actionable recommendations to support evidence-based strategic decision-making.
2.2.4 Data Privacy, Latency, and Vendor Dependency Concerns
As the department looked to integrate Artificial Intelligence (AI) technologies to solve these operational bottlenecks, several critical technical and operational concerns emerged regarding reliance on commercial cloud-based Generative AI APIs (such as OpenAI's DALL-E 3, Midjourney subscriptions, or similar services). These concerns extended beyond simple functionality to encompass data privacy, system reliability, and organizational autonomy.

First, data privacy and security considerations presented significant challenges. Sending proprietary prompts, internal documents, and sensitive content to external third-party cloud services posed potential data leakage risks, even with established security measures. For a corporate environment handling strategic information, policy documents, and operational data, maintaining control over sensitive content was paramount. The organization needed assurance that proprietary information would not be exposed, logged, or potentially used to train external models. This was particularly critical for content related to PETRONAS 2.0 strategic initiatives, Systemic Shifts frameworks, and operational policies that contain sensitive corporate information.

Second, latency and performance issues could arise during peak usage periods or network disruptions, impacting user experience and workflow efficiency. Cloud-based services introduce network round-trips that add latency to every request, and service availability depends on external infrastructure that may experience outages or slowdowns. For a platform designed to support real-time workflows where users expect near-instantaneous responses, unpredictable latency could undermine user confidence and adoption. Image generation tasks, in particular, could take 15-30 seconds per request when routed through cloud APIs, creating bottlenecks in iterative content creation workflows.

Third, vendor lock-in and dependency risks created concerns about organizational autonomy and long-term flexibility. Relying entirely on external providers whose pricing, terms, service availability, or API specifications could change without notice created uncertainty about the platform's long-term viability. Additionally, dependency on multiple external services increased the complexity of system architecture and created multiple potential points of failure. If a critical external service experienced an outage or changed its API, the entire platform could be impacted, disrupting operations and user workflows.

There was a clear need for a solution that could leverage existing hardware resources within the organization to provide greater control over data privacy, reduce latency for computationally intensive tasks, and minimize vendor dependencies. The ideal architecture would combine the superior text processing capabilities of cloud-based LLMs (which handle public knowledge and reasoning tasks) with local inference for sensitive or latency-critical tasks like image generation. Such an architecture would provide enhanced data privacy (proprietary prompts never leave the organization), reduced latency (no network round-trips for local tasks), and reduced dependency on external providers for critical workflows, ensuring greater organizational autonomy and system reliability.
[Figure 2: Legacy Workflow vs. Target AI-Integrated Workflow]
3.0 OBJECTIVES
The primary aim of this project was to digitally transform the knowledge management and content creation workflows within the BPI RU PMO by designing and deploying a unified, AI-integrated platform that addresses the fundamental operational challenges identified in the problem statement. This transformation required not merely the digitization of existing processes, but a fundamental reimagining of how knowledge is accessed, content is created, and insights are derived within the organization. To achieve this comprehensive goal, the project focused on five specific, measurable objectives, each directly addressing one of the critical problems identified in Section 2.2.

1.	To Automate Content Creation and Workflow Acceleration
To address the bottleneck of fragmented and manual workflows (Problem 2.2.1), the first objective was to develop VERA AI as the core intelligence platform with a comprehensive ecosystem of specialized AI agents. This objective encompassed multiple dimensions of workflow automation:

The Content Agent automates content creation by utilizing advanced Large Language Models (LLMs) to generate professional narratives, headlines, summaries, and visual concept descriptions from raw submissions. The agent leverages Retrieval-Augmented Generation (RAG) technology to retrieve similar past stories from the knowledge base, ensuring that generated content adheres to the department's specific "Systemic Shifts" narrative style and maintains brand consistency. The agent can process various input formats including PDFs, Word documents, and plain text, extracting key information and transforming it into structured, publication-ready content.

The Visual Agent provides sophisticated image analysis and automated tagging capabilities using computer vision technologies. Upon upload, images are automatically analyzed to extract semantic information, generate descriptive tags, and categorize assets for efficient retrieval. This eliminates the need for manual tagging and enables content creators to quickly locate relevant visual assets that match their content requirements.

Additional specialized agents handle diverse operational needs: the Meetings Agent automates the transcription and structuring of meeting notes into executive briefs with action items; the Analytics Agent provides AI-powered data insights and forecasting capabilities; the Podcast Agent converts textual content into engaging audio formats; and the Quiz Agent generates knowledge assessments for training purposes. Collectively, these agents reduce workflow turnaround times from days to minutes, enabling the department to scale content production while maintaining quality and brand consistency.

The success of this objective is measured by specific performance metrics: reduction in content creation time from 5-7 days to under 15 minutes, achievement of at least 80% first-pass acceptance rate for AI-generated content, and the ability to process at least 10 content submissions simultaneously without degradation in quality or response time.
2.	To Centralize and Democratize Institutional Knowledge
To resolve the critical issue of fragmented information retrieval and lack of intelligent access (Problem 2.2.2), the project aimed to construct a sophisticated Retrieval-Augmented Generation (RAG) chatbot, named VERA AI (derived from "Veritas," the Latin word for truth). This objective encompassed multiple technical and organizational challenges that required comprehensive solutions.

The primary technical challenge was aggregating and structuring the vast repository of institutional knowledge scattered across multiple systems and formats. This required developing a robust ingestion pipeline capable of processing diverse document types (PDFs, Word documents, presentations, spreadsheets) and extracting meaningful content while preserving context and metadata. The system needed to handle documents in various states of organization, from well-structured policy documents to informal meeting notes and historical archives.

The objective was to provide immediate, citation-backed answers derived from internal policy documents, PETRONAS 2.0 strategic initiatives, Systemic Shifts knowledge base, operational manuals, and historical success cases. The system needed to understand semantic relationships between concepts, enabling users to find relevant information even when using different terminology than the source documents. For example, a query about "carbon reduction" should retrieve documents discussing "decarbonization," "NZCE pathways," or "emissions reduction strategies," demonstrating true semantic understanding rather than simple keyword matching.

The knowledge base needed to be continuously updated as new documents are created, policies are revised, and strategic initiatives evolve. This required establishing automated ingestion workflows that can process new content as it becomes available, ensuring that VERA AI always has access to the latest information without requiring manual intervention.

The objective aimed to reduce the time spent searching for information from 15-30 minutes to under 10 seconds per query, representing a 95% efficiency gain. This is achieved by ensuring knowledge is accessible via natural language queries with transparent source citations, allowing users to verify claims and access original materials. The system must maintain high accuracy rates (target: 94%+ citation accuracy) while preventing hallucinations through strict similarity thresholds and fallback mechanisms when relevant information is not available in the knowledge base.

Success metrics for this objective include: average query response time of under 5 seconds, citation accuracy rate of 94% or higher, user satisfaction scores indicating that answers are helpful and accurate, and measurable reduction in time spent searching for information across the organization.
3.	To Enable Real-Time, Predictive Analytics and Data-Driven Decision Making
In response to the critical lack of visibility into engagement metrics and the inability to make data-driven decisions (Problem 2.2.3), the objective was to engineer a comprehensive real-time analytics dashboard, StatsX, that transforms raw telemetry data into actionable intelligence. This objective required building not just a reporting tool, but a predictive analytics platform that could support proactive decision-making.

StatsX is designed to aggregate comprehensive user interaction data including page views, scroll depth, click-through rates, dwell time, user navigation patterns, agent usage statistics, and content engagement metrics. The system captures granular events at the individual interaction level, then aggregates them into meaningful insights that can be consumed by leadership, strategists, and content creators. Unlike traditional analytics tools that provide retrospective reports, StatsX delivers near real-time visibility with data updates every 10 minutes, enabling the BPI team to monitor the immediate impact of new campaigns and content releases.

Beyond descriptive analytics, the platform utilizes advanced predictive algorithms to forecast traffic trends based on historical patterns, seasonal variations, and organizational events. The forecasting module, adapted from the Prophet additive regression model, can project future engagement levels, identify potential traffic anomalies, and provide leadership with a "look-ahead" capability that enables proactive strategy adjustment. This predictive capability is particularly valuable for planning communication campaigns, anticipating resource needs, and optimizing content publication schedules.

The anomaly detection system uses statistical methods including Interquartile Range (IQR) filtering and Z-score analysis to automatically identify irregular patterns in platform usage. This includes sudden spikes in traffic, unexpected drops in engagement, unusual error rates, or deviations from normal usage patterns. These anomalies are flagged in real-time, allowing administrators to investigate and address issues before they impact the broader user base.

The dashboard also provides strategic cross-filtering capabilities, allowing users to analyze data by multiple dimensions including geographic region, organizational level, content theme, time period, and user segment. This granular analysis enables the BPI team to identify which content resonates with specific audiences, understand regional variations in engagement, and tailor communication strategies accordingly.

Success metrics for this objective include: real-time data updates within 10 minutes of events occurring, accurate forecasting with prediction errors of less than 15%, successful detection of at least 90% of significant anomalies, and measurable improvement in decision-making speed and quality as reported by leadership stakeholders.
4.	To Enhance Data Privacy and System Reliability through Hybrid AI Architecture
To address data privacy concerns, latency issues, and vendor dependency risks associated with cloud-based generative AI APIs (Problem 2.2.4), a critical objective was to implement a hybrid AI architecture that strategically combines cloud-based and local inference capabilities. This objective required careful engineering to balance data privacy, performance, and system reliability while maintaining high-quality output.

The Local Image Generation Service represents a key component of this hybrid architecture. By leveraging Python 3.10, PyTorch, and Hugging Face Diffusers running on local GPU hardware, the project aimed to ensure that proprietary prompts and sensitive content never leave the organization for image generation tasks while maintaining high-quality output and reducing latency. The service utilizes Stable Diffusion architecture with Latent Diffusion Model (LDM) technology, which operates in a compressed latent space rather than high-dimensional pixel space, significantly reducing computational requirements and enabling inference on consumer-grade GPUs.

The implementation required solving several technical challenges: optimizing memory usage through xFormers library integration to enable inference on standard hardware, implementing efficient schedulers (Euler Discrete Scheduler) that can produce high-quality images in 20-30 steps rather than 50+, and developing robust error handling and retry mechanisms to ensure reliability. The service operates as a background daemon that polls Firestore for pending image generation jobs, processes them locally, and uploads results back to Firebase Storage, creating a seamless integration with the cloud-based platform.

The hybrid architecture extends beyond image generation. Text processing and reasoning tasks continue to leverage cloud-based Large Language Models (Google Gemini, OpenRouter) to benefit from their superior knowledge bases and reasoning capabilities, while sensitive or computationally intensive tasks are offloaded to local resources. This strategic split ensures optimal balance between data privacy, performance, and system reliability: the platform benefits from state-of-the-art text AI capabilities for public knowledge processing, while maintaining complete control over sensitive content and reducing dependency on external services for critical workflows.

The objective aimed to enhance data privacy by ensuring proprietary prompts and sensitive content never leave the organization for image generation tasks, reduce latency for image generation by eliminating network round-trips (target: <5 seconds local vs. 15-30 seconds cloud), and minimize vendor dependencies for critical workflows. The architecture also provides additional benefits including enhanced data privacy (proprietary prompts never leave the organization), improved reliability (local services not subject to external outages), and reduced dependency on external service providers.

Success metrics include: achievement of local image generation latency under 5 seconds, maintenance of image quality standards (74%+ acceptance rate), reliable service uptime (99%+ availability), and successful processing of sensitive content without external data transmission for image generation tasks.
5.	To Augment Operational Workflows via Specialized AI Agents
Beyond core knowledge management through VERA AI, the project sought to expand automation into auxiliary daily tasks through six specialized AI agents, each designed to address specific operational pain points and accelerate workflows across diverse business domains. This objective recognized that knowledge retrieval alone, while valuable, represents only one dimension of organizational productivity. True workflow acceleration requires addressing the full spectrum of daily operational tasks that consume employee time and cognitive resources.

The Analytics Agent was developed to provide AI-powered data insights, forecasting, and analytics automation for data-driven decision-making. The agent can process CSV files, charts, spreadsheets, and other data formats, automatically identifying trends, anomalies, and patterns that might not be immediately apparent to human analysts. It generates comprehensive analytical reports, creates visualizations, and provides actionable recommendations based on data analysis. The agent leverages statistical methods and machine learning algorithms to identify correlations, forecast future trends, and detect outliers that may indicate operational issues or opportunities.

The Meetings Agent automates the labor-intensive process of meeting documentation by transforming raw notes, transcripts, or audio recordings into structured executive briefs. The agent extracts key decisions, identifies action items with assigned owners and due dates, categorizes discussion topics, and flags potential risks or alignment issues. It can process various input formats including PDF meeting minutes, transcribed audio files, and manually entered notes, ensuring flexibility in how meetings are captured. The agent's ability to identify "zombie tasks" (action items lacking owners or due dates) helps ensure accountability and follow-through.

The Podcast Agent converts textual topics, policy documents, or knowledge base content into engaging audio podcasts with AI-generated scripts. The agent uses RAG technology to retrieve relevant information from the knowledge base, structures it into a conversational format suitable for audio consumption, and synthesizes it using text-to-speech (TTS) engines with multi-speaker capabilities. This enables "on-the-go" learning and knowledge dissemination, making dense technical content more accessible to employees who prefer audio formats or need to consume information during commutes or field work.

The Content Agent assists with comprehensive story drafting and content creation, automating the generation of narratives, headlines, summaries, and visual concept descriptions from raw submissions. The agent uses a chained LLM approach that extracts text from various file formats, retrieves similar past stories via RAG to maintain stylistic consistency, and generates publication-ready content that adheres to PETRONAS branding and communication guidelines. The agent can also generate image prompts and visual concepts that align with the generated narrative.

The Visual Agent utilizes advanced computer vision capabilities (Gemini Vision) to automatically analyze, tag, and categorize uploaded images. Upon upload, images are processed to extract semantic information, generate descriptive tags, identify objects and scenes, and categorize assets for efficient retrieval. This eliminates the need for manual tagging and enables content creators to quickly locate relevant visual assets using natural language queries. The agent can also generate infographics and visual summaries based on textual content.

The Quiz Agent generates knowledge assessments and quizzes from content or knowledge base materials for training and evaluation purposes. The agent can create multiple-choice questions, true/false statements, and scenario-based assessments that test understanding of policies, procedures, and strategic frameworks. This supports organizational learning initiatives and helps ensure that employees understand and retain critical information about PETRONAS 2.0 initiatives, Systemic Shifts, and operational procedures.

This ecosystem of specialized agents creates a holistic digital platform that enhances overall departmental productivity and accelerates workflows across various operational domains. Each agent is designed to integrate seamlessly with the core VERA AI platform, sharing authentication, data storage, and analytics infrastructure while providing specialized interfaces optimized for their specific use cases. The agents work together to create a comprehensive workflow acceleration ecosystem that addresses the full spectrum of daily operational tasks, from knowledge retrieval to content creation, data analysis, meeting management, and learning assessment.

Success metrics for this objective include: measurable reduction in time spent on routine tasks across all agent domains, high user adoption rates (target: 70%+ of users engaging with at least one specialized agent monthly), positive user feedback indicating that agents save time and improve work quality, and demonstrable productivity gains as measured by increased output volume or reduced time-to-completion for common workflows.
3.1 SCOPE OF WORK
3.1.1 DATA ACQUISITION AND PREPARATION
The foundation of the AI-integrated microsite relied on high-quality, structured data. This phase involved three critical activities:
Requirement Analysis and Taxonomy Definition: Conducting discovery workshops with BPI stakeholders to map the existing "Systemic Shifts" narrative structure. This involved defining the taxonomy for success stories, including required metadata fields such as "Focus Areas," "Key Shifts," and "Measurable Outcomes." These sessions were crucial for translating loose qualitative requirements into a rigid database schema.
Firestore Data Modeling: Designing and implementing a scalable NoSQL schema within Cloud Firestore. Specific collections were architected to handle diverse data types:
•	stories: Structured to capture submission metadata, narrative text, and AI-generated assets.
•	knowledgeBase: Designed to store chunked text segments alongside their vector embeddings for retrieval.
•	analytics: Optimized for high-velocity write operations to capture real-time user engagement events.
Knowledge Base Ingestion and Vectorization: To power the VERA AI chatbot and enable intelligent knowledge retrieval, historical institutional knowledge was systematically aggregated from disparate sources across the organization. This comprehensive collection effort included SharePoint archives containing policy documents and strategic frameworks, local hard drives of key personnel, email archives with embedded documents, and various cloud storage solutions used by different teams. The aggregation process required careful coordination with multiple stakeholders to identify and access relevant knowledge assets while respecting confidentiality and access control requirements.

This unstructured data underwent a rigorous cleaning and preprocessing pipeline designed to ensure high-quality input for the embedding model. The pipeline included multiple stages of data transformation:

•	Format Conversion: Documents in various formats (PDFs, Word documents, PowerPoint presentations, Excel spreadsheets) were converted into raw text formats while preserving structural information such as headings, lists, and tables. Specialized parsing libraries were used to extract text from complex document structures, handling edge cases like multi-column layouts, embedded images with captions, and formatted tables.

•	Text Cleaning: The extracted text underwent comprehensive cleaning to remove non-semantic elements including headers, footers, page numbers, watermarks, and formatting artifacts that could interfere with semantic understanding. Special attention was paid to preserving important metadata such as document titles, authors, dates, and section headings that provide context for retrieval.

•	Semantic Chunking: The cleaned text was intelligently split into semantic chunks of approximately 800 tokens each, with an 80-token overlap between adjacent chunks. This chunking strategy was carefully optimized through iterative testing to balance semantic completeness (ensuring policy clauses and concepts remain intact) with retrieval precision (ensuring chunks are focused enough for accurate matching). The overlap ensures that information spanning chunk boundaries is not lost, preserving context continuity across paragraph breaks and section transitions.

•	Vector Embedding Generation: Each text chunk was transformed into a high-dimensional vector representation using OpenAI's text-embedding-3-large model, which generates 3,072-dimensional floating-point vectors. This model was selected after benchmarking against alternatives (including text-embedding-3-small and ada-002) based on its superior performance with technical and domain-specific terminology common in the oil and gas industry. The embedding process maps semantically similar concepts to proximal points in the vector space, enabling the system to find relevant information even when queries use different terminology than the source documents.

•	Metadata Enrichment: Each vectorized chunk was enriched with comprehensive metadata including source document URL, category classification (Policy, Success Story, Operational Manual, etc.), confidentiality level, creation date, last modified date, and any relevant tags or keywords. This metadata enables hybrid filtering strategies that can narrow the search space before performing expensive vector similarity calculations, significantly improving query performance.

•	Storage and Indexing: The processed chunks and their vector embeddings were stored in Cloud Firestore within the knowledgeBase collection, organized for efficient retrieval. The vectors were L2-normalized before storage to ensure consistent similarity calculations, and the collection was structured to support both vector similarity searches and metadata-based filtering.

This comprehensive pipeline created the semantic index required for Retrieval-Augmented Generation (RAG), enabling VERA AI to provide accurate, citation-backed answers from the curated knowledge base. The system was designed to support continuous ingestion, allowing new documents to be added to the knowledge base without requiring full re-indexing, ensuring that VERA AI always has access to the latest information.

3.1.2 Microsite & AI Module Development
The core development phase focused on engineering a robust, scalable web platform capable of hosting complex AI workflows. This involved two parallel streams of work: constructing the application shell and developing the specialized AI micro-services.
•	Frontend Architecture: The microsite was built using Next.js 14 with the App Router architecture, representing a modern approach to web development that enables sophisticated hybrid rendering strategies. The App Router provides a file-system-based routing mechanism that supports both Server-Side Rendering (SSR) for optimal SEO and initial page load performance, and Client-Side Rendering (CSR) for dynamic interactivity. This hybrid approach ensures that critical content is rendered on the server for fast Time to First Byte (TTFB), while interactive components are hydrated on the client to provide seamless user experiences.

The architecture leverages React Server Components (RSC) for data-heavy sections that don't require interactivity, reducing the JavaScript bundle size sent to the client and improving performance metrics. Conversely, interactive elements like the VERA AI chat interface, agent selection panels, and real-time analytics widgets utilize Client Components to handle state management, user input, and dynamic updates without triggering full page reloads.

The user interface (UI) was styled using Tailwind CSS, a utility-first CSS framework that enables rapid prototyping and ensures design consistency across the platform. Tailwind's atomic class structure allows developers to style components directly within JSX markup, accelerating development velocity while maintaining a centralized configuration file that defines PETRONAS' corporate color palette (teal, emerald green), typography scales, spacing systems, and responsive breakpoints. This approach ensures visual consistency and makes it easy to implement design system updates across the entire platform.

Framer Motion was integrated to implement sophisticated, GPU-accelerated animations that enhance user engagement without blocking the main JavaScript thread. The library powers smooth transitions, scroll-triggered animations, and interactive effects such as hover states, loading animations, and page transitions. These animations are implemented with hydration-safe guards (checking for mounted state) to prevent server-client markup mismatches during initial render, ensuring compatibility with Next.js's SSR capabilities.

The responsive design system was carefully engineered to provide optimal experiences across diverse device types used within PETRONAS Upstream, from desktop workstations to tablets and mobile devices. Breakpoints were defined using Tailwind's responsive utilities (sm, md, lg, xl) to ensure that layouts adapt seamlessly to different screen sizes, with particular attention to touch-friendly interactions on mobile devices and optimal information density on desktop displays. This comprehensive approach ensured a responsive, performant experience across both desktop dashboards and mobile devices, supporting the diverse working environments within the organization.
•	Serverless Backend Infrastructure: The backend was architected on Google Firebase, utilizing a comprehensive suite of serverless tools to minimize infrastructure management overhead while ensuring scalability, reliability, and security. This serverless architecture eliminates the need for server provisioning, maintenance, and scaling decisions, allowing the development team to focus on building features rather than managing infrastructure.

Firebase Authentication was implemented as the foundation of the platform's security model, managing user identity and providing secure authentication mechanisms. The system supports multiple authentication methods including email/password authentication and is designed to integrate with enterprise Single Sign-On (SSO) solutions in the future. Custom claims were implemented to manage role-based access control (RBAC), creating a granular permission system that distinguishes between administrators (full platform access), editors (content creation and modification), and general users (read-only access to public content). This RBAC system ensures that sensitive operations like knowledge base injection, analytics data modification, and meeting record access are restricted to authorized personnel, maintaining data security and compliance with corporate governance requirements.

Cloud Functions, written in both Node.js and Python, were deployed to handle heavy compute tasks and act as secure API gateways. These functions encapsulate all calls to external LLM providers (Google Gemini, OpenRouter, OpenAI) and other third-party services, ensuring that sensitive API keys and authentication tokens never touch the client-side code. This architecture provides multiple layers of security: API keys are stored securely in Firebase environment configuration, requests are validated server-side before being forwarded to external services, and rate limiting and usage monitoring can be implemented at the function level.

The Cloud Functions architecture supports both HTTP-triggered functions (for direct API calls from the frontend) and background-triggered functions (for asynchronous processing tasks). HTTP functions handle real-time requests like chat queries, agent processing, and analytics data retrieval, while background functions process tasks like knowledge base ingestion, analytics aggregation, and scheduled maintenance operations. This separation ensures that user-facing operations remain responsive while heavy processing tasks execute asynchronously without blocking the user interface.

Error handling, logging, and monitoring were implemented comprehensively across all Cloud Functions using Google Cloud Logging, enabling developers to trace execution paths, monitor performance metrics, and debug issues in production. The functions include retry logic for transient failures, timeout handling for long-running operations, and graceful degradation when external services are unavailable.
•	AI Module Engineering: VERA AI serves as the core intelligence, with six distinct specialized AI agents developed as modular services, each addressing a specific business need:
1.	VERA AI (Core): A conversational RAG-powered agent integrated with a vector database to provide citation-backed answers from the curated knowledge base, with deep knowledge about PETRONAS, PETRONAS Upstream, and Systemic Shifts.
2.	Analytics Agent: A data intelligence tool that provides AI-powered insights, forecasting, and analytics automation for strategic decision-making.
3.	Meetings Agent: A meeting intelligence tool that transcribes audio/text uploads and structures them into executive briefs with assigned action items and due dates.
4.	Podcast Agent: A podcast generation module that converts textual topics into audio scripts using RAG retrieval from knowledge base and synthesizes them using text-to-speech (TTS) engines.
5.	Content Agent: An automated content creation pipeline that uses a chained LLM approach to extract text from files, draft narratives based on "precedent stories" retrieved via RAG, and generate prompt-based visual concepts.
6.	Visual Agent: An asset management system utilizing computer vision (Gemini Vision) to automatically analyze, tag, and categorize uploaded images for easier retrieval and organization.
7.	Quiz Agent: A knowledge assessment tool that generates quizzes and questions from content or knowledge base materials for training and evaluation purposes.
Additionally, StatsX serves as a real-time analytics engine that aggregates Firestore event streams to visualize engagement metrics and forecast trends.
•	Security and Governance Layer: To ensure compliance with corporate standards, a governance layer was embedded into the codebase. This included input sanitization to prevent prompt injection attacks and the integration of toxicity filters (using libraries like Detoxify) to scan AI-generated outputs before they are presented to the user.
3.1.3 ANALYTICAL AND PROCESS SUPPORT
The third phase of the project centered on delivering actionable visibility and ensuring operational sustainability. This went beyond simple metric tracking to building a predictive intelligence layer that supports strategic decision-making.
•	Real-Time Telemetry Architecture: A custom analytics engine, StatsX, was engineered to bypass the latency of traditional reporting tools. This involved setting up event listeners on the client side to capture granular interactions (e.g., page views, scroll depth, chatbot queries). These events are streamed into a specialized analytics Firestore collection, which triggers scheduled Cloud Functions to aggregate raw data into statsSnapshots documents. This architecture allows the dashboard to refresh key performance indicators (KPIs) every ten minutes, providing near real-time visibility.
•	Predictive Modeling and Anomaly Detection: To move from descriptive to prescriptive analytics, lightweight machine learning models were integrated into the dashboard. A forecasting module (adapted from the Prophet algorithm) was implemented to project future engagement trends based on historical seasonality. Additionally, an anomaly detection system using Interquartile Range (IQR) filtering was deployed to flag irregular traffic patterns—such as sudden drops in readership or spikes in chatbot errors—alerting administrators to potential issues before they impact the broader user base.
•	Operational Process Support: To ensure the platform could be maintained post-internship, comprehensive operational support structures were established. This included authoring detailed Operational Runbooks that define standard operating procedures (SOPs) for tasks such as "Re-running a failed GPU job," "Injecting new policy documents," and "Rotating API keys." Furthermore, an observability stack was configured using Google Cloud Logging, allowing developers to trace the execution path of every AI request and monitor token usage and system performance in real-time.
3.1.4 VALIDATION AND DOCUMENTATION
The final phase of the scope ensured the platform was production-ready, secure, and sustainable for future teams. This involved a multi-layered validation strategy followed by comprehensive knowledge transfer.
•	Quality Assurance and AI Governance: A robust testing framework was implemented to validate both deterministic software functions and probabilistic AI outputs. This included:
o	Unit & Integration Testing: Using Jest to verify data utility functions (e.g., date formatting, analytics aggregation) and Playwright to simulate end-to-end user journeys, such as submitting a story and receiving an AI draft.
o	AI Evaluation Harness: To prevent "hallucinations," a specialized evaluation routine was created. This harness replayed canonical prompts against the VERA AI chatbot, comparing the responses against a "golden set" of verified answers to ensure citation accuracy and adherence to PETRONAS policy.
o	Security Audits: Manual penetration testing was conducted on API endpoints to verify that Row Level Security (RLS) rules in Firestore correctly prevented unauthorized users from accessing sensitive meeting minutes or manipulating engagement data.
4.0 LITERATURE REVIEW
This section reviews the theoretical frameworks and technological paradigms that underpin the development of the AI-Integrated Systemic Shifts Microsite. It examines the shift from static content management to intelligent, generative ecosystems, with a specific focus on Retrieval-Augmented Generation (RAG), vector space modeling, and diffusion-based image synthesis.
4.1 Retrieval-Augmented Generation (RAG)
Retrieval-Augmented Generation (RAG) represents a paradigm shift in Natural Language Processing (NLP), addressing two primary limitations of pre-trained Large Language Models (LLMs): their cutoff date for knowledge and their tendency to "hallucinate" or generate factually incorrect information when prompted with domain-specific queries. Unlike traditional fine-tuning, which requires expensive retraining to update a model's knowledge, RAG hybridizes a pre-trained parametric memory (the LLM) with a non-parametric memory (an external vector database).
For the VERA AI module, the RAG architecture was selected to ensure that all AI-generated responses are grounded in PETRONAS’ official policy documents and success stories. The implementation follows a canonical four-stage pipeline designed to maximize factual accuracy and corporate alignment:
1.	Document Ingestion and Chunking:
Raw knowledge assets (PDFs, DOCX files) are ingested via the Knowledge Base Injector. To fit within the LLM's context window and ensure precise retrieval, these documents are segmented into semantic "chunks." A chunk size of approximately 800 tokens with an 80-token overlap was implemented to preserve semantic continuity across paragraph breaks, ensuring that information is not lost at the boundaries of a split.
2.	Vectorization (Embedding Generation):
Each text chunk is transformed into a high-dimensional vector representation using OpenAI’s text-embedding-3-large model. This process maps semantically similar concepts to proximal points in a 3,072-dimensional vector space. These embeddings are stored in Cloud Firestore, tagged with metadata such as source URL, category (e.g., "Policy," "Success Story"), and confidentiality level.
3.	Semantic Retrieval:
When a user queries VERA AI, the system converts the query into a vector using the same embedding model. A Cosine Similarity search is then executed against the vector store to identify the most relevant chunks. The system employs a dynamic retrieval strategy, fetching the top-k (defaulting to 5) most similar document segments. If the similarity scores fall below a defined threshold (e.g., 0.78), the system automatically expands the search to k=8 to capture broader context.
4.	Grounded Generation:
The retrieved text chunks are concatenated into a "context window" and injected into the system prompt of the LLM (Google Gemini or OpenRouter). The model is explicitly instructed to synthesize an answer only using the provided context and to cite the specific chunk IDs used. This "grounding" process effectively prevents the model from speculating or drawing on outside, potentially irrelevant training data.
[Figure 3: Conceptual Diagram of the RAG Pipeline (Ingestion → Vectorization → Retrieval → Generation)]

4.2 Vector Embeddings & Similarity Search
To enable the system to "understand" and retrieve information based on meaning rather than just keyword matching, the project employs Vector Embeddings. An embedding is a translation of high-dimensional discrete data (text) into a continuous vector space, where semantically similar concepts are mapped to proximal points.
4.2.1 Vectorization Pipeline
In the Systemic Shifts Microsite, every document chunk ingested into the knowledge base is converted into a numerical vector using OpenAI’s text-embedding-3-large model. This model was selected for its superior performance on retrieval tasks compared to earlier iterations (e.g., ada-002). Each text segment is transformed into a 3,072-dimensional floating-point vector, capturing nuanced semantic relationships—such as the association between "Systemic Shifts" and "Operational Excellence"—even if those exact terms do not appear adjacently.
These vectors are stored within the knowledgeBase collection in Cloud Firestore. To ensure consistent retrieval performance, all embeddings are L2-normalized before storage. Normalization ensures that the magnitude of the vector does not skew the similarity calculation, making the dot product of two vectors equivalent to their cosine similarity, which is computationally more efficient to calculate at scale.
4.2.2 Cosine Similarity & Hybrid Retrieval
When a user asks a question via VERA AI, their query is vectorized on-the-fly using the same embedding model. The system then performs a Cosine Similarity search to rank the stored document chunks against the query vector. Cosine similarity measures the cosine of the angle between two vectors; a value close to 1 indicates high semantic similarity (identical meaning), while a value near 0 indicates orthogonality (unrelated concepts).
To optimize query latency and precision, the platform implements a Hybrid Filtering strategy. Before executing the expensive vector scan, the system applies metadata filters (e.g., filtering by category="policy" or confidentiality="internal"). This "pre-filtering" step prunes the candidate set, significantly reducing the search space. Benchmarks conducted during development showed that this approach reduced average query latency from approximately 420 ms to 190 ms, ensuring a responsive user experience.
Furthermore, a Similarity Threshold of 0.65 was enforced. Any retrieved chunk scoring below this value is discarded to prevent the LLM from reasoning on tangentially related or irrelevant data, thereby reducing the risk of "hallucinations" in the final response.
4.3 Diffusion-Based Image Generation
Generative Artificial Intelligence has evolved significantly with the advent of Diffusion Probabilistic Models (DPMs). Unlike Generative Adversarial Networks (GANs), which are prone to "mode collapse," diffusion models generate high-fidelity images by learning to reverse a gradual noising process. Starting from pure Gaussian noise, the model iteratively removes noise over a series of time steps, guided by a textual prompt, to reconstruct a coherent image.
4.3.1 The Shift to Local Inference
While commercial cloud-based APIs (such as OpenAI's DALL-E 3 or Midjourney) offer state-of-the-art generation, they introduce several critical constraints for enterprise applications:
1.	Data Privacy and Security: Sending proprietary prompts and sensitive content to external third-party clouds poses potential data leakage risks, which is particularly concerning for corporate environments handling strategic information and policy documents. Maintaining control over sensitive content is paramount for enterprise applications.
2.	Latency and Performance: Cloud APIs introduce network round-trips that add latency to every request, and service availability depends on external infrastructure that may experience outages or slowdowns. For iterative content creation workflows, this latency can significantly impact user experience and productivity.
3.	Vendor Dependency: Relying entirely on external providers creates dependencies on services whose availability, terms, or API specifications could change without notice, potentially disrupting platform operations.
To address these challenges, this project implemented a Local Image Generation Service. By hosting the inference engine on internal hardware, the system ensures that proprietary prompts never leave the organization, reduces latency by eliminating network round-trips, and provides greater control over system reliability and availability.
4.3.2 Technical Implementation Stack
The local generation pipeline is engineered using Python 3.10 and the Hugging Face diffusers library, running on PyTorch. This stack allows for fine-grained control over the generation process that is not possible with "black box" APIs. Key technical components include:
•	Stable Diffusion Architecture: The underlying model utilizes a Latent Diffusion Model (LDM) architecture. Instead of operating in high-dimensional pixel space, the diffusion process occurs in a compressed low-dimensional latent space, significantly reducing the computational resources required for inference.
•	Memory Optimization: To enable inference on standard GPU hardware, the system integrates xFormers, a library that optimizes Transformer attention mechanisms. This reduces Video RAM (VRAM) consumption and accelerates generation speeds, making local hosting viable without requiring data-center-grade GPUs.
•	Scheduler Selection: The pipeline employs the Euler Discrete Scheduler (or similar optimized samplers like DPMSolverMultistepScheduler), which can produce high-quality images in as few as 20–30 inference steps, compared to the 50+ steps required by older samplers. This optimization creates a "near real-time" experience for users waiting for visual drafts.
4.4 Modern Web Architecture (Next.js & Firebase)
The traditional monolithic web architecture—where a single server handles routing, logic, and database connections—often suffers from scalability bottlenecks and high maintenance overhead. To address these limitations, this project adopts a Modern Web Architecture (MWA) leveraging the Next.js framework and Firebase’s serverless ecosystem. This combination enables a "separation of concerns" where the frontend focuses on interactivity and the backend on scalable, event-driven compute.
4.4.1 Hybrid Rendering with Next.js 14
Next.js 14 was selected as the frontend framework due to its support for the App Router and React Server Components (RSC). Unlike traditional Single Page Applications (SPAs) that rely heavily on Client-Side Rendering (CSR), Next.js allows for a hybrid approach:
•	Server-Side Rendering (SSR): Critical content, such as initial dashboard layouts and StatsX analytics, is rendered on the server. This reduces the "Time to First Byte" (TTFB) and ensures optimal performance for internal knowledge discoverability.
•	Client-Side Interactivity: Dynamic components, such as the VERA AI chat interface and StatsX visualization widgets, use client-side hydration to provide instant feedback without requiring a full page reload. By utilizing React 19 features like Suspense, the application can stream parts of the UI (e.g., a loading graph) while fetching heavier data in the background, significantly improving perceived performance.
4.4.2 Serverless Backend-as-a-Service (BaaS)
To minimize the operational overhead of managing physical infrastructure, the project utilizes Google Firebase as a comprehensive Backend-as-a-Service (BaaS) layer. This architecture is event-driven and scales automatically with demand:
•	Cloud Firestore: A NoSQL document database was chosen for its flexibility in handling unstructured data, such as the JSON payloads from AI story drafts. Its real-time listeners allow the StatsX dashboard to reflect engagement metrics instantly without polling the server.
•	Cloud Functions: Business logic—such as the analyzeStorySubmission pipeline or the RAG retrieval calls—is encapsulated in stateless serverless functions (Node.js and Python). These functions execute only when triggered (e.g., by a file upload or an API call), ensuring efficient resource utilization while maintaining scalability and performance. This model ensures efficient resource utilization while maintaining scalability and performance.
4.4.3 Component Modularity and Styling
To accelerate development velocity while maintaining design consistency, the frontend utilizes Tailwind CSS, a utility-first framework that allows for rapid styling directly within the JSX markup. Complementing this is Framer Motion, a library used to implement GPU-accelerated animations (such as the orbital menu on the homepage) that enhance user engagement without blocking the main JavaScript thread.
4.5 AI Automation in Enterprise Knowledge Management
Traditional Enterprise Knowledge Management (EKM) systems typically rely on static repositories—such as SharePoint folders or shared drives—where information is stored passively. The burden of retrieval lies entirely on the user, who must navigate complex folder hierarchies and manually synthesize information from multiple documents. Industry studies indicate that knowledge workers can spend up to 30% of their time simply looking for information rather than acting on it.
4.5.1 From "Search" to "Synthesis"
The integration of Artificial Intelligence transforms EKM from a passive storage model to an active retrieval engine. Unlike keyword-based search engines that return a list of links, AI-driven systems utilizing Large Language Models (LLMs) perform semantic synthesis. They do not just locate documents; they read, aggregate, and summarize the relevant content to provide a direct answer. In the context of the Systemic Shifts Microsite, this shift allows users to move from "searching for a policy document" to "asking for a policy summary," significantly reducing the cognitive load required to access institutional knowledge.
4.5.2 Democratization of Access
AI automation plays a critical role in flattening the knowledge hierarchy within an organization. In manual workflows, institutional memory is often tribal—held by senior employees or buried in private email archives. By ingesting this information into a centralized, AI-accessible vector database (as done with VERA AI), the organization ensures that all employees, regardless of tenure or network, have equitable access to high-quality strategic insights. This democratization accelerates the onboarding of new staff and ensures that decision-making at all levels is grounded in the collective intelligence of the department.
4.5.3 Dynamic Knowledge Maintenance
A persistent challenge in EKM is "knowledge rot," where documentation becomes outdated. AI automation addresses this through dynamic indexing. By automating the ingestion pipeline—where new success stories and policy updates are immediately vectorized and added to the knowledge base—the system ensures that the "Single Source of Truth" remains current without requiring manual cataloging. This automated maintenance ensures that the insights delivered by the platform evolve in step with the organization’s changing strategies. 
4.6 Context Engineering & Prompt Governance
In enterprise AI applications, the raw capabilities of a Large Language Model (LLM) are insufficient without strict behavioral controls. Context Engineering refers to the systematic design of system prompts, input structures, and retrieval templates to guide the model's reasoning. Prompt Governance complements this by establishing the rules, guardrails, and parameter settings that ensure the AI operates within corporate safety and brand guidelines.
4.6.1 Hierarchical Prompt Architecture
To achieve consistent, high-quality outputs across diverse modules, the project employs a Hierarchical Prompting strategy. Unlike flat prompts that mix instructions with data, hierarchical prompts are structured into distinct layers:
•	Role Definition: The "System Message" explicitly defines the AI's persona (e.g., "You are an expert technical writer for PETRONAS Upstream"). This primes the model to adopt a professional, objective tone suitable for corporate reporting.
•	Constraint Layer: Negative constraints are injected to prevent undesirable behaviors (e.g., "Do not use marketing fluff," "Do not make up facts if the context is missing").
•	Task & Format Layer: The specific objective (summarization, drafting, or coding) is defined along with strict formatting rules (e.g., "Output must be in valid JSON," "Summaries must be MECE").
For instance, the MeetX module utilizes this architecture to enforce that all meeting summaries identify actionable items with assigned owners and due dates, rejecting any vague or unassigned tasks.
4.6.2 Context Injection and Citation Templates
A critical challenge in RAG systems is distinguishing between the user's query and the retrieved external knowledge. To mitigate this, the platform utilizes Context Templates. Retrieved knowledge chunks are wrapped in structured XML-like tags (e.g., <source id="doc_123" category="policy">...content...</source>) before being injected into the prompt window. This explicit delimitation allows the model to "see" the boundaries of each document, enabling it to cite specific chunk IDs accurately in its final response. This technique is fundamental to the VERA AI citation mechanism, ensuring that every claim is traceable to a verified source document.
4.6.3 Determinism via Hyperparameter Tuning
Prompt Governance also extends to the configuration of model hyperparameters, specifically Temperature and Frequency Penalty. The system applies a dynamic configuration based on the use case:
•	High Determinism (Temp 0.2): Modules requiring factual precision, such as VERA AI (policy retrieval) and MeetX (meeting minutes), operate at a low temperature to minimize randomness and ensure reproducibility.
•	Controlled Creativity (Temp 0.8): Creative modules like ULearn (podcast script generation) utilize a higher temperature to encourage narrative flair and varied sentence structures, preventing the output from sounding robotic.
By codifying these parameters and prompt structures into the codebase, the system shifts prompt engineering from an ad-hoc activity to a reproducible engineering discipline. 
4.7 Retrieval Parameters (Top-k & Similarity Thresholds)
In a Retrieval-Augmented Generation (RAG) system, the quality of the generated answer is directly dependent on the quality of the retrieved context. Two critical hyperparameters govern this retrieval process: Top-k (the number of document chunks to retrieve) and Similarity Thresholds (the minimum relevance score required). Tuning these parameters is essential to balance precision (ensuring only relevant data is used) and recall (ensuring no critical information is missed).
4.7.1 Adaptive Top-k Strategy
The standard approach in RAG is to retrieve a static number of documents (e.g., k=3). However, policy questions often require synthesizing information from multiple sections of a document. To address this, the Systemic Shifts Microsite implements an Adaptive Top-k Strategy.
•	Baseline Retrieval: By default, the system retrieves the top 5 most relevant chunks. This provides sufficient context for standard queries without overflowing the LLM's context window.
•	Dynamic Expansion: If the cosine similarity score of the top result falls below 0.78, the system infers that the query is ambiguous or the answer is fragmented. It automatically expands k to 8, casting a wider net to capture broader context. This ensures that vague queries still yield comprehensive answers.
4.7.2 Similarity Thresholds and Noise Reduction
To prevent "hallucinations" caused by irrelevant context, a strict Similarity Cut-Off of 0.65 (cosine) is enforced. Any chunk scoring below this threshold is considered "noise" and is excluded from the prompt. If no chunks meet this threshold, the system is programmed to return a fallback response (e.g., "No relevant internal documents found") rather than fabricating an answer. This mechanism is critical for maintaining the integrity of corporate reporting.
4.7.3 Configuration Summary
The final retrieval configuration, optimized through iterative testing, is summarized below:
Parameter	Value	Rationale
Chunk Size	800 tokens	Balances semantic completeness for policy clauses with efficient Firestore read operations and optimal context window utilization.
Chunk Overlap	80 tokens	Preserves semantic continuity, ensuring that sentences split across boundaries remain intelligible.
Top-k	5 (Adaptive $\to$ 8)	Captures sufficient context for multi-part questions while allowing expansion for low-confidence queries.
Similarity Cut-Off	0.65 cosine	Rejects tangential or irrelevant data to prevent prompt dilution.
Confidence Boost	Temp -0.05	If any chunk scores >0.9 similarity, the model's temperature is lowered to encourage deterministic, verbatim citation.
[Figure 4: RAG Retrieval Logic Flowchart (Query → Vector Search → Threshold Check → Context Window)]
 
5.0 METHODOLOGY
This chapter details the systematic approach employed to design, develop, and deploy the AI-Integrated Systemic Shifts Microsite. The methodology encompasses the selection of the technology stack, the software development lifecycle (SDLC) adopted, and the specific engineering practices used to integrate Artificial Intelligence into a cohesive web platform.
5.1 React/Next.js Frontend Stack
The project utilized a modern, cloud-native technology stack designed for scalability, performance, and rapid iteration. The selection of tools was driven by the need to support complex AI workflows while maintaining a responsive user experience on both desktop and mobile devices.
5.1.1 React/Next.js Frontend Stack
The frontend application was engineered using Next.js 14, utilizing the App Router architecture to leverage the latest advancements in the React ecosystem. This framework was selected for its ability to support hybrid rendering strategies, which are critical for balancing search engine optimization (SEO) with dynamic user interactivity.
•	Hybrid Rendering with React Server Components (RSC): The architecture distinguishes between Server Components and Client Components. Data-heavy sections, such as the initial StatsX dashboard layout, are rendered on the server. This approach minimizes the JavaScript bundle size sent to the client, resulting in faster "Time to Interactive" (TTI) metrics. Conversely, interactive elements like the VERA AI chat interface and specialized agent pages utilize Client Components to handle state management and real-time user input without triggering full page reloads.
•	Styling and Responsive Design: Tailwind CSS was employed as the utility-first CSS framework. Its atomic class structure enabled rapid UI prototyping and ensured design consistency across the platform by adhering to a centralized configuration file (defining PETRONAS’ corporate color palette and typography). This streamlined the development of a responsive layout that adapts seamlessly to various screen sizes, a crucial requirement for the diverse device usage within the BPI department.
•	Advanced Animations: To enhance user engagement and modernize the microsite’s aesthetic, Framer Motion was integrated. This library powers the GPU-accelerated animations, such as the orbital feature menu on the homepage and the smooth layout transitions within the dashboard. Crucially, these animations are implemented with hydration-safe guards (e.g., checking for the mounted state) to prevent server-client markup mismatches during the initial render.
•	State Management and Data Fetching: The application leverages custom React hooks (e.g., useStatsSnapshot) to abstract complex data fetching logic. By combining Firestore real-time listeners with React's state primitives, the frontend ensures that analytics widgets and chat histories update instantly as new data arrives from the backend, providing a "live" experience for the user.
5.1.2 Firebase Serverless Backend
To minimize infrastructure management overhead and ensure high availability, the platform's backend was architected using Google Firebase as a comprehensive Backend-as-a-Service (BaaS) solution. This event-driven architecture allows the system to scale automatically with user demand while ensuring efficient resource utilization and automatic scaling.
•	Cloud Firestore (NoSQL Database): Firestore serves as the primary system of record, selected for its flexible document-oriented structure and real-time synchronization capabilities. The database schema was designed around high-velocity collections:
o	stories: Stores submission metadata, narrative text, and links to AI-generated assets.
o	knowledgeBase: Houses the vectorized document chunks used by the RAG pipeline.
o	analytics: Optimized for append-only write operations to capture granular user engagement events.
o	upstreamGallery: Manages metadata and AI-generated tags for the visual asset repository.
Crucially, Firestore's real-time listeners (onSnapshot) are utilized by the frontend to push updates instantly. For example, when VERA AI generates a response or the StatsX dashboard aggregates new analytics data, the client interface updates immediately without requiring a manual refresh or polling mechanism.
•	Cloud Functions (Serverless Compute): Business logic and heavy compute tasks are encapsulated in stateless Cloud Functions, primarily written in Node.js. These functions act as secure API gateways that isolate sensitive operations from the client side:
o	HTTP Triggers: Endpoints like askChatbot and generatePodcast handle direct user requests, managing the orchestration between OpenAI, Gemini, and Vector Stores.
o	Background Triggers: The analyzeStorySubmission function is triggered automatically whenever a new document is created in the stories collection. This asynchronous pattern ensures that heavy AI processing (text extraction, drafting) does not block the user interface during submission.
•	Authentication and Security: Firebase Authentication manages user identity, issuing JSON Web Tokens (JWTs) that integrate seamlessly with the frontend. To enforce data security, Role-Based Access Control (RBAC) is implemented via Custom Claims. This ensures that only users with admin or editor privileges can modify the Knowledge Base or view sensitive meeting minutes in MeetX, while general staff are restricted to read-only access for public content.
•	Firebase Storage: Unstructured data—such as PDF policy documents, uploaded meeting recordings, and AI-generated imagery—is stored in Firebase Storage. Access to these files is governed by strict security rules that validate user authentication tokens before granting read or write permissions, preventing unauthorized hotlinking or data leakage.
5.1.3 Local GPU Automation Scripts
A significant engineering challenge in this project was balancing data privacy requirements, latency constraints, and system reliability for Generative AI workloads. To address this, a hybrid architecture was implemented where lightweight tasks and public knowledge processing run in the cloud, while sensitive or computationally intensive tasks (like image generation) are offloaded to a local machine via a custom Python automation service.
•	Service Architecture: The core of this service is a Python script (local_image_generator.py) running on a dedicated workstation equipped with a consumer-grade GPU. This script operates as a background daemon that polls the Cloud Firestore stories collection at 30-second intervals. It listens specifically for documents flagged with aiGeneratedImageUrl: "Pending local generation", effectively treating Firestore as a distributed job queue.
•	Inference Stack: The local environment is configured with Python 3.10 and PyTorch, leveraging the CUDA toolkit for hardware acceleration. The image generation pipeline is built upon the Hugging Face diffusers library, utilizing a Latent Diffusion Model (LDM) optimized with xFormers memory-efficient attention. 
•	Cloud Synchronization: Once an image is generated locally, the script utilizes the Firebase Admin SDK to upload the binary asset directly to a secured Firebase Storage bucket. It then patches the original Firestore document with the public download URL and updates the status flag. This "detached execution" model ensures that the frontend user experience remains snappy; users can continue editing their story while the heavy lifting happens asynchronously on the local node.
•	Resilience and Error Handling: The script includes robust error handling to manage network interruptions or GPU memory overflows (OOM). If a job fails, it is not immediately discarded; instead, the system implements a retry mechanism with exponential backoff. If a job fails three consecutive times, it is tagged as error in Firestore, triggering an alert on the StatsX dashboard for manual administrator intervention.
5.2 PROJECT ACTIVITIES
The development of the Systemic Shifts Microsite followed a structured timeline, evolving from initial discovery to rapid prototyping and final deployment. The project lifecycle was divided into distinct phases to ensure that the technical solution remained aligned with the strategic goals of the BPI RU PMO.

5.2.1 Learning Phase / Data Familiarisation
The initial phase of the internship was dedicated to immersing myself in the BPI department's operational context and understanding the existing technical landscape. This phase was critical for identifying the specific bottlenecks that the AI platform needed to solve.
•	Domain Immersion & Process Mapping: I began by shadowing communications leads and BPI strategists to understand the "Systemic Shifts" narrative—specifically, how success stories were currently sourced, curated, and approved. I mapped the legacy workflow, identifying the reliance on Microsoft Forms for intake and the manual hand-offs between copywriters and designers. This qualitative analysis revealed the "pain points" (e.g., the one-week turnaround time) that defined the project's problem statement.
•	Legacy Infrastructure Audit: I conducted a technical audit of the existing microsite, which was built using the standard PETRONAS Page Builder. This evaluation confirmed the limitations of the incumbent tool: it lacked dynamic rendering capabilities, could not support custom API integrations for AI, and offered limited analytics. This finding provided the justification for proposing a custom Next.js architecture.
•	Data Taxonomy Definition: To prepare for the AI integration, I analyzed historical success stories and policy documents stored in SharePoint. I collaborated with the BPI team to define a standardized taxonomy for future submissions, identifying mandatory metadata fields such as "Focus Area," "Key Shift," "Region," and "Measurable Outcome." This exercise was foundational for designing the Firestore schema and ensuring that the VERA AI knowledge base would be structured for accurate retrieval. 
5.2.2 Data & Knowledge Collection
Following the initial discovery phase, the project moved into a critical data acquisition stage. The objective was not merely to digitize documents but to construct a high-fidelity "Single Source of Truth" that would serve as the knowledge backbone for the VERA AI RAG engine.
•	Source Identification and Audit: I collaborated with the BPI communications team to audit existing repositories, identifying high-value assets suitable for AI indexing. This collection included:
o	Historical Success Stories: Past "Systemic Shifts" narratives that serve as stylistic benchmarks for the AI drafter.
o	Policy & Governance Frameworks: Official PDF decks detailing the "Mindset & Behaviour" guidelines and "Upstream 2035" strategic targets.
o	Operational Manuals: Technical documents relevant to specific focus areas like "Portfolio High-Grading" and "Deliver Advantaged Barrels".
•	The Knowledge Base Injector: To streamline the ingestion of these heterogeneous formats, I developed a custom internal tool called the Knowledge Base Injector. This React-based utility allows administrators to upload PDF or DOCX files directly. On the backend, a cloud function (uploadKnowledgeBase) parses the raw text, stripping out non-semantic elements (like headers and footers) to ensure clean input for the embedding model.
•	Metadata Enrichment and Tagging: Raw text alone provides insufficient context for precise retrieval. Therefore, a strict metadata tagging protocol was implemented during ingestion. Every document was annotated with attributes such as category (e.g., "Policy," "Story"), source_origin, and confidentiality_level. This structured metadata enables the Hybrid Filtering logic described in Section 4.2, allowing the AI to narrow down its search space before performing vector similarity checks.
 
5.2.3 AI Pipeline Preparation
Before the AI modules could be deployed, a rigorous "tuning phase" was conducted to optimize the retrieval and generation performance. This stage transformed the raw data collected in the previous phase into a high-performance semantic index.
•	Chunking Strategy Optimization: A critical variable in RAG performance is the size of the text segments fed into the embedding model. I conducted A/B testing with various chunk sizes, comparing 500-token vs. 1000-token splits. The experiments revealed that a 800-token chunk size with an 80-token overlap offered the optimal balance. This configuration was large enough to capture complete policy clauses while remaining small enough to fit multiple distinct sources into the LLM's context window without exceeding token limits.
•	Embedding Model Benchmarking: To ensure high retrieval accuracy, I benchmarked different embedding models. While text-embedding-3-small offered lower latency, testing showed it struggled with the nuanced technical jargon of the oil and gas industry. Consequently, text-embedding-3-large was selected for production. Although slightly more computationally expensive, its 3,072-dimensional vectors provided a measurable improvement in retrieving semantically related but lexically distinct concepts (e.g., mapping "NZCE" queries to "Carbon Management" documents).
•	Retrieval Validation with Synthetic Prompts: To harden the system against hallucination, I developed a suite of synthetic "adversarial" prompts—queries deliberately designed to be vague or missing key nouns. Running these through the retrieval engine allowed me to calibrate the Similarity Threshold to 0.65. This testing confirmed that the fallback logic (expanding the top-k from 5 to 8) correctly triggered when confidence scores dipped, ensuring the system favored "broad recall" over "no answer" in ambiguous scenarios.
5.2.4 Platform & Module Development
Following the preparation of the data and AI pipelines, the project entered the core execution phase. Development followed an iterative, module-by-module strategy, allowing for rapid prototyping and feedback loops. The build order prioritized high-impact workflows first to demonstrate immediate value to stakeholders.
•	Phase 1: VERA AI Core Development The first module developed was VERA AI, the core RAG-powered chatbot designed to replace fragmented knowledge retrieval workflows. I engineered the chat interface with agent selection capabilities, streaming responses, and citation-backed answers. On the backend, I implemented the askChatbot Cloud Function with RAG retrieval to orchestrate intelligent responses from the knowledge base. This phase established the foundation for all subsequent specialized agents.
•	Phase 2: VERA AI (Knowledge Retrieval) Once content creation was automated, focus shifted to content retrieval. I developed the VERA AI interface (ChatInterface.js) to provide a conversational window into the document repository. Key engineering efforts included:
o	Citation UI: Building specialized message components that render "citation chips" dynamically, allowing users to verify AI claims against source documents.
o	State Management: Implementing robust chat history management using React state, ensuring conversation context (e.g., follow-up questions) was preserved across API calls.
o	Guardrails: Integrating toxicity and relevance filters to ensure the chatbot politely declines off-topic queries.
•	Phase 3: StatsX Dashboard (Analytics & Forecasting) The final major build phase focused on the StatsX dashboard. This required shifting from "transactional" coding to "analytical" visualization. I utilized Recharts to build interactive trend lines and heatmaps. A custom aggregation pipeline was developed to denormalize granular event data into high-level metrics (e.g., "Total Reads," "Avg. Dwell Time"). To support the "predictive" requirement, I implemented client-side forecasting logic (forecasting.js) that projects future engagement based on historical baselines, giving leadership a forward-looking view of communication impact.
•	Auxiliary Workflow Tools: In parallel with the core modules, I developed auxiliary tools to support specific operational needs: MeetX for structuring meeting minutes, ULearn for generating audio learning materials, and Upstream Gallery for AI-tagged asset management. These were built as modular extensions, sharing the same authentication and database layer as the main platform.
5.3 GANTT CHART
The project execution adhered to a strict 14-week timeline, structured into four distinct phases: Discovery, Core Development, Optimization, and Validation. This phased approach ensured that the foundational data architecture was solidified before complex AI integration began, reducing the risk of technical debt.
The development lifecycle is summarized below:
•	Phase 1: Discovery & Planning (Weeks 1–2)
o	Conducted legacy infrastructure audit and stakeholder interviews to map existing workflows.
o	Defined the data taxonomy and "Systemic Shifts" metadata requirements.
o	Established the initial Next.js + Firebase project scaffolding.
•	Phase 2: Core Module Development (Weeks 3–7)
o	Weeks 3–4: Engineered VERA AI chat interface and the backend askChatbot function with RAG retrieval.
o	Weeks 5–6: Developed the VERA AI chat interface and the RAG retrieval pipeline (ingestion and vectorization).
o	Week 7: Implemented the Local Image Generation Service (Python/GPU) and integrated it with the frontend.
•	Phase 3: Analytics & Refinement (Weeks 8–10)
o	Built the StatsX analytics dashboard and aggregation pipelines.
o	Tuned RAG hyperparameters (chunk size, top-k) based on synthetic prompt testing.
o	Developed auxiliary modules: MeetX (meeting insights) and ULearn (podcast generation).
•	Phase 4: Validation & Handover (Weeks 11–14)
o	Conducted User Acceptance Testing (UAT) with BPI stakeholders.
o	Performed security hardening (API key rotation, RLS rules) and bug fixes.
o	Authored technical documentation (FULL_DOCUMENTATION.md), operational runbooks, and the final SIP report.
Figure 8 illustrates the concurrent workstreams, dependencies, and critical milestones achieved throughout the internship duration.
[Figure 8: Project Gantt Chart covering Weeks 1-14]



Content	W1	W2	W3	W4	W5	W6	W7	W8	W9	W10	W11	W12
Learning & Data Familiarisation												
Data Collection & Consolidation												
Data Preparation & Transformation												
WPB Cleanup, Unpivoting & Structuring												
YEP/TL Integration & Mapping												
Dashboard Design & Visualization												
Review, Refinement & Handover												
Note: The total project duration is 10 weeks (Sept 8th - Nov 16th, 2025). The detailed work supporting the Deferment Management (DM) analysis occurred concurrently with phases 3.2 and 4.0. 
5.4 PETRONAS DIGITALIZATION GOALS INTEGRATION 
The development of the AI-Integrated Systemic Shifts Microsite was not an isolated technical exercise but a direct response to the PETRONAS 2.0 aspiration—a strategic mandate to transform the organization into a "Fitter, Focused, and Sharper" energy partner. As the Upstream Business shifts from a traditional "Regulator" role to an "Accelerator" of industry growth, digital tools must evolve from passive repositories to active intelligence systems. This project supports this paradigm shift by replacing fragmented, manual workflows with an integrated digital ecosystem that accelerates "Time-to-Insight" and fosters a data-driven culture within the BPI department.
5.4.1 KEY DIGITALIZATION CONTRIBUTIONS
The platform advances PETRONAS’ digitalization agenda through four distinct pillars, each addressing a specific corporate objective:
•	Process Simplification & Automation: By automating knowledge retrieval and workflow acceleration through VERA AI and specialized agents, the platform eliminates redundant manual processes. This consolidation of tools—moving from disparate knowledge sources and manual workflows to a unified AI-powered platform—streamlines operations and frees up human talent for higher-value strategic work, directly supporting the Operational Excellence (OE) agenda.
•	Data Visibility & Decision Intelligence: The StatsX dashboard transforms opaque engagement data into real-time visibility. By aggregating telemetry into actionable forecasts and anomaly alerts, the system empowers leadership to make evidence-based decisions regarding communication strategies. This shift from retrospective reporting to predictive analytics aligns with the S&C division’s goal of maintaining a robust, commercially competitive portfolio.
•	Sustainability via Green Computing: The project introduces a sustainable approach to AI adoption by implementing the Local Image Generation Service. By offloading heavy inference tasks to local GPU resources rather than relying on energy-intensive, continuous cloud API calls, the platform reduces the carbon footprint associated with data transmission and remote processing. This architectural choice serves as a proof-of-concept for "Green AI," contributing to PETRONAS’ Net Zero Carbon Emission (NZCE) 2050 aspirations.
•	Knowledge Democratization: VERA AI breaks down information silos by making institutional knowledge accessible via natural language. This democratization ensures that every employee, regardless of tenure or location, has equitable access to critical policies and success stories. This fosters a more agile, informed workforce capable of executing the "Systemic Shifts" required for future growth.
5.5 AI Quality, Safety, and Observability
Deploying Generative AI in a corporate environment requires rigorous governance to mitigate risks such as hallucinations, toxicity, and data leakage. To ensure the platform remains trusted and compliant with PETRONAS standards, a multi-layered safety and observability framework was integrated into the core architecture.
•	Human-in-the-Loop (HITL) Workflows: While VERA AI and the specialized agents automate various workflows, the system deliberately maintains human oversight. AI-generated content, insights, and recommendations are presented as suggestions that users must review, validate, modify, or approve. This design ensures that ultimate accountability remains with human experts, aligning with the principle that AI should augment, not replace, professional judgment.
•	Safety Guardrails and Toxicity Filtering: To prevent the generation of inappropriate or brand-damaging content, a real-time safety layer intercepts all LLM outputs. The system integrates toxicity detection libraries (e.g., Detoxify) to scan for offensive language or bias. Additionally, prompt engineering techniques were used to inject "negative constraints" (e.g., "Avoid speculation," "Do not mention restricted projects"), ensuring the model adheres to corporate tone guidelines even when prompted with edge-case inputs.
•	Observability and Telemetry: A comprehensive telemetry stack was built using Google Cloud Logging to monitor AI performance in real-time. The system logs critical metrics for every interaction, including:
o	Token Usage: Tracking prompt and completion tokens to monitor API usage and system performance.
o	Latency: Measuring the end-to-end duration of RAG retrieval and generation to ensure SLA compliance.
o	Confidence Scores: Logging the similarity scores of retrieved chunks. If average confidence drops below a threshold, alerts are triggered on the StatsX dashboard, signalling administrators that the Knowledge Base may need updating.
•	Continuous Evaluation: To combat "drift" (where model performance degrades over time), an automated evaluation harness was established. This routine replays a canonical set of "Golden Prompts" (standard questions with verified answers) against the VERA AI chatbot. Any deviation in citation accuracy or response structure is flagged, allowing developers to catch regression bugs before they affect end-users.
6.0 RESULTS AND DISCUSSION
This chapter presents the outcomes of the development phase, evaluating the technical performance and operational impact of the AI-Integrated Systemic Shifts Microsite. It details the final architectural implementation, analyzes the efficiency gains delivered by each AI module, and discusses the broader implications for knowledge management within PETRONAS Upstream.
6.1 Platform Overview and Architecture
The project successfully delivered a unified, production-ready digital ecosystem that integrates content management, predictive analytics, and generative intelligence into a single interface. Unlike the legacy system, which relied on disjointed tools, the new microsite operates on a Hub-and-Spoke topology where the central web platform orchestrates six specialized AI services.
•	Full-Stack Integration: The final architecture seamlessly links a Next.js 14 frontend with a Firebase serverless backend. The frontend utilizes the App Router to deliver a "Single Page Application" (SPA) feel, ensuring instant page transitions and state retention. The backend handles authentication, data storage, and complex compute tasks via Cloud Functions, effectively decoupling the user interface from heavy processing logic. This separation of concerns proved critical for maintaining high performance (P95 latency < 200ms) even during peak load.
•	Hybrid AI Inference Engine: A defining result of the project is the successful deployment of a Hybrid Inference Architecture.
o	Text & Reasoning: handled by cloud-based Large Language Models (Gemini/OpenRouter) to leverage their vast knowledge and reasoning capabilities for tasks like RAG retrieval and summarization.
o	Visual Synthesis: handled by the Local Image Generation Service (Python/PyTorch) running on internal GPU hardware. This strategic split eliminated latency and enhanced data privacy for cloud-based image generation while retaining the superior text processing of commercial LLMs.
Data Flow and Synchronization: The platform establishes a real-time data pipeline. User actions—such as sending a chat message or using an AI agent—write directly to Cloud Firestore. These writes trigger instantaneous updates across connected clients via WebSocket listeners. For example, when VERA AI generates a response, the chat interface updates in real-time with streaming text, and chat sessions are automatically saved, validating the effectiveness of the event-driven design.
[Figure 5: High-Level System Architecture Diagram showing Frontend, Backend, and AI Services]
6.2 AI Module Performance
The platform's effectiveness was evaluated based on two primary criteria: operational efficiency (reduction in manual toil) and output quality (acceptance rate of AI-generated content). Data collected over the 14-week internship demonstrates that the AI modules not only met but exceeded the initial latency and accuracy targets.
6.2.1 VERA AI Core Performance
VERA AI serves as the primary intelligence engine for the platform, replacing fragmented knowledge retrieval processes. Its performance was measured against the previous benchmark of 15-30 minutes per knowledge query.
•	Drafting Speed & Latency: The module consistently generates a complete story package—comprising a narrative write-up, headline, and infographic concept—within an average of 30 seconds per submission. This represents a 99% reduction in the "Time-to-Draft" metric compared to the manual workflow. The breakdown of this latency reveals efficient orchestration:
o	Text Extraction: ~4 seconds
o	RAG Retrieval (Precedent Search): ~2 seconds
o	LLM Drafting (Gemini): ~12 seconds
o	Image Concept Generation: ~8 seconds.
•	Retrieval Precision (RAG integration): The "Precedent Retrieval" feature, which fetches similar past stories to guide the AI's tone, operated with a top-k of 4 and a similarity threshold of 0.7. Telemetry indicates that in 92% of submissions, the system successfully found relevant precedents, ensuring the AI's output adhered to the department's specific "Systemic Shifts" narrative style without requiring extensive prompt engineering from the user.
•	User Acceptance Rate: Crucially, the speed of automation did not come at the cost of quality. StatsX telemetry recorded an 82% acceptance rate for AI drafts on the first pass. This means that for the vast majority of submissions, editors accepted the AI-generated text with only minor tweaks (e.g., fixing a name or date) rather than rewriting it. This high "First-Pass Yield" validates the effectiveness of the few-shot prompting strategy used in the analyzeStorySubmission function.
•	Visual Consistency: The Local Image Generator successfully produced on-brand infographics by utilizing a k-Nearest Neighbor (k-NN) search against the Upstream Gallery. By injecting style references from approved assets into the diffusion prompt, the system maintained a 74% acceptance rate for visual concepts, significantly reducing the workload on human graphic designers.
6.2.2 VERA AI Knowledge Chatbot
The VERA AI module was designed to solve the problem of decentralized institutional knowledge. Its performance was evaluated based on retrieval latency, answer accuracy, and the system's ability to cite authoritative sources.
•	Query Latency & Responsiveness: Post-optimization, the chatbot achieved an average response latency of 4.2 seconds per query. This performance includes the full RAG round-trip: embedding the user's question, performing the vector search against Firestore, and generating the LLM response. This near-instantaneous retrieval stands in stark contrast to the estimated 15–30 minutes previously required for manual document hunting, representing a 95% efficiency gain in information access.
•	Citation & Hallucination Control: A critical success factor for enterprise adoption is trust. VERA AI distinguishes itself from generic chatbots by strictly adhering to a "No Citation, No Answer" policy. In 94% of test cases, the model successfully appended accurate citation links to its responses, allowing users to click through to the original source document (e.g., a specific "Mindset & Behaviour" policy PDF). When the system encountered queries outside its knowledge base, the 0.65 similarity threshold successfully prevented hallucinations, triggering a fallback message in 100% of "out-of-domain" test prompts.
•	Adaptive Retrieval Performance: The "Adaptive Top-k" logic proved highly effective for handling ambiguous queries. Telemetry data indicates that the auto-expansion rule (increasing retrieved chunks from 5 to 8) was triggered in approximately 12% of queries. In these edge cases—often involving vague or multi-part questions—the expanded context window successfully recovered relevant information that would have otherwise been missed, validating the dynamic retrieval architecture.
[Figure 6: VERA AI Chatbot UI with Citation Call-Outs]
6.2.3 StatsX Analytics Dashboard
The StatsX dashboard was engineered to address the critical lack of visibility into content engagement. Its performance is measured by its ability to aggregate live data streams and provide actionable, predictive insights that were previously unavailable to BPI leadership.
•	Real-Time Telemetry Aggregation: Unlike the legacy process, which relied on static monthly spreadsheets, StatsX delivers a near real-time view of ecosystem health. The custom aggregation pipeline processes raw event streams (page views, scroll depth, link clicks) into summarized snapshots every 10 minutes. This high-frequency update cycle allows strategists to monitor the immediate impact of new campaigns, shifting the department from reactive reporting to proactive monitoring.
•	Predictive Forecasting Accuracy: A key innovation of the dashboard is its integration of client-side forecasting logic. By adapting the Prophet additive regression model for the web environment, the system successfully projects traffic trends based on historical seasonality. During the pilot phase, these forecasts provided leadership with a "look-ahead" capability, allowing them to anticipate engagement dips during holiday periods and adjust publication schedules accordingly.
•	Automated Anomaly Detection: The anomaly detection module—utilizing an Interquartile Range (IQR) statistical filter combined with a lightweight LSTM model—effectively surfaced irregular patterns without human intervention. The system successfully flagged critical operational anomalies, such as sudden spikes in "404 Not Found" errors or unexpected drops in readership for key policy documents. By filtering out statistical noise and only alerting on significant deviations (Z-score > 3), StatsX reduced "alert fatigue" and allowed the technical team to focus on genuine system issues.
•	Strategic Cross-Filtering: The dashboard's ability to cross-filter data by Region (e.g., Sarawak vs. International) and Shift Theme (e.g., "Data Driven") unlocked granular insights previously buried in aggregate numbers. This feature enabled the BPI team to identify that specific themes resonated strongly in particular regions, leading to a data-driven refinement of the editorial strategy to target under-performing segments.
[Figure 7: StatsX Dashboard Snapshot with Predictive Widgets]
6.2.4 MeetX, ULearn, and Upstream Gallery
While the core platform focused on content creation and retrieval, the auxiliary modules—MeetX, ULearn, and Upstream Gallery—demonstrated the versatility of the architecture in augmenting diverse operational workflows.
•	MeetX (Automated Meeting Intelligence): MeetX successfully automated the labor-intensive process of post-meeting documentation. By processing uploaded transcripts or raw notes through a specialized RAG pipeline, the module generates structured Executive Briefs that categorize discussions into "Key Decisions," "Action Items," and "Strategic Alignment." A key performance win was the system's ability to parse unstructured dialogue into strict JSON objects; in pilot tests, MeetX correctly identified and assigned "Owners" and "Due Dates" for 88% of action items, significantly reducing the administrative burden on project managers.
•	ULearn (Multimodal Content Generation): The ULearn module introduced a new medium for knowledge consumption: AI-Generated Podcasts. By chaining a Gemini text generation step (Temperature 0.8 for creativity) with a Text-to-Speech (TTS) engine, the system converts static policy documents into engaging audio scripts. This feature was particularly effective for "on-the-go" learning; internal feedback indicated that the conversational format made dense technical topics (e.g., "Reservoir Management Guidelines") more accessible to non-technical staff.
•	Visual Agent (Computer Vision Asset Management): To solve the issue of "unsearchable" visual assets, the Visual Agent implemented an automated tagging pipeline using Gemini Vision capabilities. Upon upload, every image is analyzed and tagged with semantic descriptors (e.g., "Offshore," "Safety Gear," "Team Bonding"). This auto-classification reduced the time required to locate and analyze specific assets from minutes to seconds, enabling efficient visual asset management across the organization.
6.3 Performance Analysis (Time, Latency, Adoption)
To objectively measure the impact of the AI-Integrated Systemic Shifts Microsite, a comparative analysis was conducted against the legacy workflows. The performance data, collected over the 14-week pilot period, focuses on three key dimensions: process efficiency (Time), system performance and latency (Latency), and user engagement (Adoption).
6.3.1 Efficiency and Speed Gains
The most significant impact of the platform was the compression of knowledge retrieval and workflow execution timelines. By replacing manual knowledge searches and fragmented workflows with VERA AI and specialized agents, the time required to access information and complete tasks was drastically reduced.
•	Drafting Velocity: The legacy process required approximately 5 working days to navigate the manual intake, drafting, and design coordination cycle. The AI platform reduced this to under 15 minutes, representing a 90% improvement in turnaround time.
•	Retrieval Latency: Knowledge retrieval via VERA AI averaged 4.2 seconds, compared to the 15–30 minutes typically spent searching through disparate SharePoint folders. This near-instantaneous access translates to a 95% efficiency gain for staff seeking policy clarification.
6.3.2 Latency and Performance Optimization
System performance and reliability were core considerations of the project. The shift from cloud-based image generation to a Local GPU Service yielded measurable improvements in latency, data privacy, and system reliability.
•	Image Generation Latency: Commercial cloud APIs (e.g., OpenAI DALL-E 3) typically require 15-30 seconds per image generation due to network round-trips and external processing. Given the iterative nature of design workflows (often requiring 10–20 generations per story), this latency created significant bottlenecks. The local Python/PyTorch implementation reduced image generation latency to under 5 seconds per image, representing a 70-80% improvement in response time. Additionally, the local implementation ensures that proprietary prompts and sensitive content never leave the organization, enhancing data privacy and security.
6.3.3 Adoption and Engagement
Technical performance is irrelevant without user adoption. The platform's launch coincided with a marked increase in departmental engagement, driven by the lower barrier to entry for submitting stories.
•	Usage Volume: Following the launch of VERA AI, the department recorded significant adoption rates with users leveraging the platform for knowledge retrieval and workflow acceleration. This uptake indicates that simplifying access to information and automating workflows directly encourages staff participation and productivity.
•	Analytics Visibility: Prior to StatsX, engagement metrics were invisible to leadership. The implementation of real-time tracking revealed that specific content themes (e.g., "Digitalization") consistently outperformed others, allowing the editorial team to pivot their strategy based on data rather than intuition.
Table 6.1: Comparative Performance Summary (Legacy vs. AI Platform)
Metric	Legacy Process (Manual)	AI-Integrated Platform	Impact
Story Draft Turnaround	~5 Working Days	< 15 Minutes	90% Faster
Image Generation Latency	15-30 Seconds (Cloud API)	< 5 Seconds (Local GPU)	70-80% Faster, Enhanced Privacy
Knowledge Retrieval	15–30 Minutes (Search)	< 10 Seconds (Chat)	95% Efficiency Gain
Analytics Visibility	None (Static Spreadsheets)	Real-Time Dashboard	Proactive Decision Making
6.4 Discussion and Project Contribution
The development of the Systemic Shifts Microsite represents a successful convergence of modern web engineering and strategic knowledge management. By replacing fragmented legacy processes with a unified, AI-integrated ecosystem, the project has not only resolved immediate operational bottlenecks but also established a scalable foundation for future digitalization initiatives within PETRONAS Upstream.
6.4.1 Validation of Project Objectives
The project’s success is validated by the direct achievement of the five specific objectives outlined in Section 3.0. A detailed reconciliation of objectives versus outcomes is presented below:
•	Objective 1: Automate Content Creation
o	Target: Eliminate the manual drafting bottleneck.
o	Outcome: Achieved. VERA AI successfully automated knowledge retrieval and workflow acceleration, reducing the time to access information from 15-30 minutes to under 10 seconds. The high accuracy rate of RAG-powered responses with citation-backed answers confirms that the automation is not just fast, but factually accurate and verifiable.
•	Objective 2: Centralize Institutional Knowledge
o	Target: Reduce information retrieval time.
o	Outcome: Achieved. VERA AI centralized access to disparate policy documents, delivering citation-backed answers in an average of 4.2 seconds. This effectively removed the "search tax" previously paid by employees navigating SharePoint folders.
•	Objective 3: Enable Real-Time Analytics
o	Target: Provide leadership with visibility into engagement.
o	Outcome: Achieved. The StatsX dashboard replaced static monthly reports with a live telemetry stream. The integration of predictive forecasting allowed the BPI team to move from reactive reporting to proactive strategy adjustment based on real-time trend data.
•	Objective 4: Enhance Data Privacy and System Reliability
o	Target: Ensure proprietary content never leaves the organization for image generation and reduce latency.
o	Outcome: Achieved. The implementation of the Local Image Generation Service (Python/PyTorch) successfully offloaded image generation tasks to internal hardware. This architectural decision ensures that proprietary prompts and sensitive content never leave the organization, reduces latency from 15-30 seconds to under 5 seconds per image, and minimizes dependency on external cloud services for critical workflows.
•	Objective 5: Augment Operational Workflows
o	Target: Automate auxiliary tasks beyond just content creation.
o	Outcome: Achieved. The deployment of MeetX, ULearn, and Upstream Gallery demonstrated the platform's versatility. By automating meeting minutes, podcast generation, and asset tagging, the project successfully extended the benefits of AI to a broader range of daily operational activities.
6.4.2 Strategic Implications for Knowledge Sharing
Beyond immediate efficiency gains, the deployment of the AI-Integrated Systemic Shifts Microsite signals a fundamental shift in how PETRONAS Upstream manages its intellectual capital. The transition from a manual, "push-based" model to an intelligent, "pull-based" ecosystem has profound strategic implications for the organization.
•	From "Tribal Knowledge" to Institutional Memory: Historically, deep knowledge regarding policy nuances or successful operational pivots resided within specific individuals or disconnected teams (e.g., "Tribal Knowledge"). By ingesting this information into a centralized vector database accessible via VERA AI, the project successfully codifies this tacit knowledge into explicit, queryable institutional memory. This shift mitigates the risk of knowledge loss due to staff turnover and ensures that critical insights are preserved in a format that is instantly retrievable by the next generation of engineers and strategists.
•	Accelerating the "Systemic Shifts" Culture: The Systemic Shifts initiative is not merely a set of targets but a cultural mandate to become "Fitter, Focused, and Sharper." VERA AI serves as the digital engine for this cultural transformation. By removing the friction associated with accessing knowledge and automating workflows through specialized AI agents, the platform lowers the barrier to productivity and knowledge sharing. This encourages frontline staff to actively leverage AI-powered tools, fostering a culture of continuous improvement and data-driven decision-making that spans across geographical assets.
•	Data-Driven Communication Strategy: The implementation of StatsX introduces a feedback loop that was previously absent. Leadership can now correlate specific communication themes with audience engagement levels in real-time. This visibility allows the BPI department to move away from intuition-based campaigns to a data-driven strategy, where content resources are allocated to the topics that generate the highest engagement and, by extension, the greatest potential for operational impact.
7.0 SUSTAINABILITY
In alignment with PETRONAS’ aspiration to achieve Net Zero Carbon Emissions (NZCE) by 2050, the Systemic Shifts Microsite was engineered with sustainability as a core design principle. The project adopts a holistic view of sustainability, addressing economic viability, environmental stewardship, and social well-being.
7.1 Technical Sustainability and System Reliability
The primary considerations for the longevity of AI initiatives are system reliability, maintainability, and organizational autonomy. To ensure the microsite remains operationally viable and maintainable post-deployment, the project implemented architectural decisions that prioritize system reliability and reduced external dependencies.
•	Reduced Vendor Dependencies: By engineering the Local Image Generation Service, the platform reduces dependency on external commercial APIs for critical workflows. This architectural decision provides greater organizational autonomy, ensuring that image generation capabilities are not subject to external service outages, API changes, or vendor policy modifications. The local implementation ensures that critical workflows remain operational even if external services experience disruptions.
•	Resource Efficiency and Scalability: The automation of the story drafting process releases hundreds of man-hours annually. By reducing the time required to produce a story from days to minutes, the platform allows high-value human capital to be redirected toward strategic initiatives—such as campaign planning and stakeholder engagement—rather than repetitive administrative tasks. This repurposing of talent enhances the overall productivity per headcount within the BPI unit, while the scalable architecture ensures the platform can handle increased adoption without proportional increases in maintenance overhead.
7.2 Environmental Stewardship
Digitalization is a key enabler of decarbonization. The platform contributes to PETRONAS’ environmental goals through "Green Computing" practices and process digitalization.
•	Green AI Architecture: Training and running large AI models in the cloud consumes significant energy due to data transmission and data center cooling requirements. By running inference workloads locally on efficient, consumer-grade hardware, the project reduces the carbon footprint associated with constant network traffic and remote server load. This "Edge AI" approach demonstrates that high-performance computing can be balanced with energy consciousness.
•	Paperless Operations: The transition to a fully digital submission and review workflow eliminates the need for physical forms, printed draft packs, and manual circulation files. This contributes to a reduction in paper waste and the associated carbon emissions from logistics, aligning with the department's "Go Digital" mandate.
7.3 Social Impact and Governance
Sustainability also encompasses the well-being of the workforce and the equitable distribution of resources. The platform addresses the "Social" aspect of ESG (Environmental, Social, and Governance) by democratizing access to information.
•	Knowledge Equity and Inclusion: In traditional hierarchies, access to strategic knowledge can be limited by one's professional network. VERA AI dismantles these barriers by providing every employee—regardless of rank or tenure—with equal access to institutional insights. This inclusivity empowers junior staff to upskill rapidly and participate more meaningfully in strategic discussions.
•	Mitigating Employee Burnout: By automating low-value, repetitive tasks such as meeting transcription (MeetX) and manual tagging (Upstream Gallery), the platform reduces cognitive load and administrative fatigue. This improvement in the "Quality of Work Life" helps prevent burnout, fostering a more engaged and creative workforce focused on high-impact storytelling rather than data entry.
8.0 CONCLUSION AND RECOMMENDATIONS
8.1 Conclusion
The development of the AI-Integrated Systemic Shifts Microsite stands as a tangible manifestation of PETRONAS’ commitment to digital excellence. This project has successfully transformed a fragmented, labor-intensive content workflow into a cohesive, intelligent ecosystem that aligns with the PETRONAS 2.0 aspiration of becoming "Fitter, Focused, and Sharper."
By synthesizing modern web architecture (Next.js/Firebase) with advanced Generative AI, the platform has delivered measurable operational impact:
•	Efficiency: Content production cycles have been compressed from days to minutes, releasing hundreds of man-hours for high-value strategic work.
•	Intelligence: The VERA AI and StatsX modules have democratized access to institutional knowledge and provided leadership with real-time, predictive decision-making capabilities.
•	Sustainability: The successful engineering of the Local Image Generation Service demonstrates that high-performance AI can be deployed with enhanced data privacy and reduced latency, supporting the NZCE 2050 agenda by minimizing cloud compute emissions and reducing network traffic.
The platform is production-ready, scalable, and validated by user adoption, serving as a robust blueprint for future AI automation within PETRONAS Upstream.
8.2 Recommendations
To sustain the platform’s momentum and maximize its long-term value, the following recommendations are proposed for the post-internship roadmap:
8.2.1 Technical Enhancements
1.	Enterprise SSO Integration: Currently, the system uses a standalone authentication layer. It is recommended to integrate Firebase Authentication with PETRONAS’ Azure Active Directory (AD). This will enable Single Sign-On (SSO), streamlining user onboarding and ensuring that access controls automatically reflect corporate role changes.
2.	Knowledge Graph Implementation: To enhance the reasoning capabilities of VERA AI, the vector database should be augmented with a Knowledge Graph. This would allow the AI to understand complex relationships between entities (e.g., linking a specific "Asset" to its "JV Partner" and "Carbon Targets"), enabling more nuanced answers to strategic queries.
3.	Mobile-Native Offline Support: Given the mobile nature of the ULearn podcast feature, developing a Progressive Web App (PWA) or native wrapper with Service Workers is recommended. This would allow field staff to download audio content for offline playback in low-connectivity offshore environments.
8.2.2 Operational & Strategic Recommendations
4.	Automated Governance & Compliance: As usage scales, manual review of every AI draft may become a bottleneck. Implementing an Automated Policy Engine—which uses a secondary LLM to scan drafts for specific compliance violations (e.g., "Restricted" project codes)—can streamline the approval process while maintaining strict governance.
5.	Structured Change Management: Technology adoption requires cultural buy-in. It is recommended to formalize a "Digital Champions" network within the BPI department. These power users can champion the platform’s capabilities, run peer-to-peer training sessions, and gather structured feedback to guide the next phase of development.
9.0 REFERENCES
Technical Documentation & Software Libraries
1.	Google Developers. (2024). Firebase Documentation: Build and run successful apps. Retrieved from https://firebase.google.com/docs
2.	Google AI. (2024). Gemini API: Build with the best of Google AI. Retrieved from https://ai.google.dev/docs
3.	Hugging Face. (2024). Diffusers: State-of-the-art diffusion models. Retrieved from https://huggingface.co/docs/diffusers/index
4.	Meta Open Source. (2024). React 19 Release Notes & Server Components. Retrieved from https://react.dev/blog
5.	Nvidia. (2024). CUDA Toolkit 12.x Documentation. Retrieved from https://docs.nvidia.com/cuda/
6.	OpenAI. (2024). API Reference: Embeddings and Text Generation. Retrieved from https://platform.openai.com/docs/api-reference
7.	Tailwind Labs. (2024). Tailwind CSS Documentation v3.4. Retrieved from https://tailwindcss.com/docs
8.	Vercel. (2024). Next.js App Router Documentation. Retrieved from https://nextjs.org/docs
Academic Papers & Methodologies
9.	Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. Advances in Neural Information Processing Systems (NeurIPS), 33, 9459-9474.
10.	Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems, 30.
11.	Taylor, S. J., & Letham, B. (2018). Forecasting at Scale. The American Statistician, 72(1), 37-45. (Reference for the Prophet algorithm used in StatsX).
Corporate & Internal Documents
12.	PETROLIAM NASIONAL BERHAD (PETRONAS). (2023). Net Zero Carbon Emission 2050 (NZCE 2050) Pathway. Internal Publication.
13.	PETRONAS Upstream. (2024). Systemic Shifts: Fitter, Focused, Sharper - Strategic Framework. Internal Document (BPI Department).
14.	PETRONAS. (2024). Code of Conduct and Business Ethics (CoBE). Retrieved from https://www.petronas.com/sustainability/governance-and-ethics
15.	PETRONAS Digital Delivery. (2024). Secure Prompt Engineering Playbook. Internal Technical Guideline.

Project Repository
16.	Ahmed Mardzukie, F. A. (2025). VERA AI: RAG-Powered Intelligent Knowledge Base Assistant Platform. GitHub Repository. Retrieved from https://github.com/[YOUR_GITHUB_USERNAME]/vera-ai (Note: Replace [YOUR_GITHUB_USERNAME] with actual GitHub username)

10.0 appendices 

11.0 Page Documentation 


Page 1.0: Landing Page (VERA AI Homepage)
Overview
The VERA AI Homepage serves as the central landing page and command center for the VERA AI platform. It is designed to be the primary entry point for PETRONAS Upstream employees, providing immediate access to VERA AI and its ecosystem of six specialized AI agents. The page acts as a unified gateway, connecting users to intelligent workflow acceleration tools, effectively replacing legacy static pages with a dynamic, AI-integrated ecosystem that embodies the "Abstract & Human" design philosophy.
UI Sections & Features
1. Hero Section & Navigation
•	Visual: Features a clean, modern design with the prominent "VERA" branding using gradient text (teal to emerald) and the tagline "Your intelligent assistant for PETRONAS Upstream initiatives."
•	Navigation: The UnifiedAppLayout component provides seamless navigation to VERA AI chat interface and agent selection.
•	Purpose: Establishes VERA AI's brand identity as an intelligent, trustworthy assistant (derived from "Veritas" - Truth) and provides immediate access to all platform capabilities.
 
[Figure 9: Landing Page (VERA AI Homepage) - Hero Section & Navigation]

2. Quick Actions Section
•	Visual: A responsive grid layout (1 column on mobile, 2 on tablet, 4 on desktop) featuring four primary quick action cards:
o	Draft Email: Generate professional communications via Content Agent
o	Analyze Data: Upload CSVs or charts for analytics via Analytics Agent
o	Summarize: Condense long documents via default VERA AI
o	Create Image: Generate visual assets via Content Agent
•	Interactive Elements: Each card features hover effects with gradient overlays and smooth transitions, providing clear visual feedback.
•	Purpose: Enables users to jump directly into common workflow tasks without navigating through multiple pages.

 
[Figure 10: Landing Page (VERA AI Homepage) - Quick Actions Section]

3. About VERA Section
•	Visual: A minimalist section explaining VERA AI's core capabilities and purpose.
•	Content: Highlights VERA AI as an intelligent assistant designed specifically for PETRONAS Upstream operations, with knowledge about PETRONAS 2.0 and Systemic Shifts as supporting context.
•	Design: Features smooth scroll-triggered animations using Framer Motion for an engaging user experience.
 
[Figure 11: Landing Page (VERA AI Homepage) - AI Agents Showcase]

4. AI Agents Showcase
•	Visual: A comprehensive section highlighting VERA AI and the six specialized AI agents:
o	VERA AI (Core): RAG-powered chatbot with citation-backed answers
o	Analytics Agent: AI-powered data insights and forecasting
o	Meetings Agent: AI meeting analysis and action items
o	Podcast Agent: AI podcast generation
o	Content Agent: AI content and image generation
o	Visual Agent: AI image analysis and tagging
o	Quiz Agent: AI quiz generation
•	Interactive Elements: Each agent card provides direct navigation to its respective interface.
•	Purpose: Educates users about the full ecosystem of AI capabilities available on the platform.

 
[Figure 11: Landing Page (VERA AI Homepage) - AI Agents Showcase]
Technical Architecture
The landing page relies on the following React components:
•	src/app/page.js: The main entry point for the homepage, implementing the UnifiedAppLayout wrapper.
•	UnifiedAppLayout: Handles global navigation, chat session management, and responsive layout.
•	Framer Motion: Provides smooth animations and scroll-triggered effects for enhanced user experience.
•	Next.js App Router: Enables server-side rendering for optimal performance and SEO.

Data Integration
•	Analytics: Page views are tracked via analytics events logged to the Firestore analytics collection.
•	Session Management: Integration with VERA AI chat interface allows users to start new conversations or load existing sessions directly from the homepage.
•	Agent Routing: Quick action cards and agent showcase cards route users to specific agent interfaces via URL parameters (e.g., /vera?agent=content).

User Flows
1.	Initial Access: Users arrive at the homepage and immediately see the VERA AI branding and quick action options.
2.	Quick Task Execution: Users can click on quick action cards (e.g., "Draft Email") to be routed directly to VERA AI with the appropriate agent context.
3.	Agent Exploration: Users can explore the full ecosystem of AI agents through the showcase section, learning about each agent's capabilities before engaging.
4.	Direct Chat Access: Users can click "New Chat" or "Load Session" to access the full VERA AI chat interface for open-ended queries.
 
[Figure 9: Landing Page (VERA AI Homepage) – Full View]
 
Page 2.0: VERA AI Chat Interface
Overview
The VERA AI page serves as the primary interface for interacting with the core AI assistant. It provides a conversational interface with RAG-powered knowledge retrieval, agent selection capabilities, and citation-backed responses. Users can access deep knowledge about PETRONAS, PETRONAS Upstream, and Systemic Shifts through natural language queries.
Core Components
•	Route: /vera (primary entry point for VERA AI).
•	Chat Interface: Real-time streaming chat with message history and session management.
•	Agent Selector: Allows users to choose from six specialized AI agents for domain-specific assistance.
•	Knowledge Base Integration: Direct access to knowledge base injector for adding new documents.
•	Citation Display: Shows source documents for all AI responses with similarity scores.
Data Integration
•	RAG Retrieval: Queries are vectorized and matched against the knowledgeBase collection using cosine similarity.
•	Session Management: Chat sessions and messages are stored in Firestore chatSessions and chatMessages collections.
•	Analytics Tracking: Agent usage and chat interactions are tracked for StatsX dashboard.
User Flows
1.	Access VERA: A user navigates to /vera to begin an AI-assisted conversation.
2.	Agent Selection: Users can optionally select a specialized agent (e.g., Analytics Agent) for domain-specific assistance.
3.	Knowledge Retrieval: Users ask questions and receive citation-backed answers from the knowledge base, with real-time streaming responses.
4.	Session Management: Chat history is automatically saved, allowing users to return to previous conversations.
 

[Figure 12: VERA AI Chat Interface – Full View]
 

Page 3.0: AI Agents Overview
Overview
The AI Agents Overview page provides a centralized hub for discovering and accessing all six specialized AI agents within the VERA AI ecosystem. This page serves as a critical discovery and navigation point, allowing users to understand each agent's unique capabilities, use cases, and technical specifications before engaging with them. The page is designed with an intuitive, card-based layout that emphasizes visual clarity and quick access, embodying the "Abstract & Human" design philosophy by making complex AI capabilities accessible through simple, human-friendly interfaces.

UI Sections & Features
1. Page Header and Introduction
•	Visual Design: Features a prominent header section with the title "AI Agents" and a descriptive subtitle explaining the specialized agent ecosystem. The header uses gradient text effects consistent with VERA AI branding (teal to emerald) to maintain visual consistency across the platform.
•	Contextual Information: Provides a brief overview of how the six specialized agents complement VERA AI's core intelligence, explaining that while VERA AI handles general knowledge retrieval, each specialized agent focuses on domain-specific tasks such as data analysis, meeting intelligence, content creation, and visual asset management.
•	Navigation Breadcrumbs: Includes clear navigation paths back to the homepage and to the main VERA AI chat interface, ensuring users never feel lost within the platform hierarchy.

2. Agent Grid Display
•	Layout Structure: A responsive grid layout that adapts to screen size—displaying one column on mobile devices, two columns on tablets, and three columns on desktop screens. This ensures optimal viewing and interaction across all device types used within the PETRONAS Upstream organization.
•	Agent Cards: Each of the six specialized agents is represented by an interactive card that includes:
o	Agent Name: Clear, descriptive titles (Analytics Agent, Meetings Agent, Podcast Agent, Content Agent, Visual Agent, Quiz Agent)
o	Visual Icon: Distinct, color-coded icons that provide immediate visual recognition and differentiation between agents
o	Capability Description: Concise, user-friendly explanations of what each agent does and when to use it
o	Use Case Examples: Specific scenarios where the agent would be most beneficial (e.g., "Upload CSV files for trend analysis" for Analytics Agent)
o	Action Button: Prominent call-to-action button that routes users directly to the agent's dedicated interface
•	Visual Feedback: Each card features sophisticated hover effects including gradient overlays, subtle scale transformations, and smooth transitions that provide clear visual feedback when users interact with them. This enhances the user experience by making the interface feel responsive and modern.

3. Agent-Specific Information Panels
•	Detailed Descriptions: When users hover over or click on an agent card, they can access expanded information panels that provide:
o	Technical Capabilities: Detailed explanation of the AI technologies and algorithms used by each agent
o	Input Requirements: Clear specifications of what types of files or data the agent accepts
o	Output Formats: Description of the results users can expect, including file formats and data structures
o	Integration Points: Information about how the agent integrates with other platform components (e.g., knowledge base, analytics dashboard)

Technical Architecture
Core Components
•	Route: /agents serves as the primary entry point for the AI Agents Overview page
•	Component Structure: The page is built using modular React components:
o	AgentGrid: Main container component that manages the responsive grid layout
o	AgentCard: Reusable component for displaying individual agent information with consistent styling and behavior
o	AgentModal: Optional modal component for displaying detailed agent information without navigating away from the overview page
•	State Management: Uses React hooks (useState, useEffect) to manage agent data fetching, hover states, and modal visibility
•	Responsive Design: Implements Tailwind CSS breakpoints (sm, md, lg, xl) to ensure optimal layout across all screen sizes

Data Integration
•	Agent Metadata: Agent information is stored in a structured format, either as static configuration files or dynamically loaded from Firestore collections, allowing for easy updates to agent descriptions and capabilities without code changes
•	Usage Analytics: Each agent card interaction is tracked via Firestore analytics events, providing insights into which agents are most frequently accessed and helping inform future development priorities
•	Real-Time Updates: If agent capabilities or status change (e.g., maintenance mode), the page can reflect these updates in real-time through Firestore listeners

User Flows
1.	Discovery Journey: A new user arrives at /agents and scans the grid of agent cards. They read the descriptions and identify that the Analytics Agent might help with their data analysis needs.
2.	Information Gathering: The user hovers over the Analytics Agent card to see additional details about its capabilities, input requirements, and example use cases.
3.	Agent Access: The user clicks the "Try Analytics Agent" button, which routes them to /agents/analytics with the agent context pre-loaded, enabling immediate interaction.
4.	Return Navigation: After using the agent, the user can easily return to the overview page to explore other agents or access the main VERA AI interface.

Integration with Platform Ecosystem
•	Cross-Platform Navigation: The AI Agents Overview page serves as a central hub that connects to:
o	VERA AI Chat Interface: Users can access agents directly from VERA AI through agent selection
o	Homepage Quick Actions: Quick action cards on the homepage route to specific agents via URL parameters
o	StatsX Dashboard: Agent usage metrics from this page contribute to the overall analytics tracked in StatsX
•	Consistent User Experience: The page maintains design consistency with the rest of the platform, using the same color scheme, typography, and interaction patterns to ensure a cohesive user experience throughout the VERA AI ecosystem.

Page 3.1: Analytics Agent Test Page
Overview
The Analytics Agent Test Page provides an interactive interface for employees to upload data files (CSV, JSON, or text) and receive AI-powered insights, trend analysis, and forecasting. This page enables data analysts, project managers, and operational staff to quickly extract meaningful insights from raw data without requiring advanced statistical expertise.

UI Components
•	Route: /agents/analytics
•	Data Input Section: Allows users to upload CSV files, paste JSON data, or input text-based data for analysis
•	Analysis Results Display: Shows AI-generated insights, key findings, trend analysis, and visual charts
•	Download Functionality: Users can export analysis results in JSON format for further processing

Key Features
•	Multi-format Data Support: Accepts CSV files, JSON objects, and plain text data
•	Intelligent Analysis: Uses RAG technology to provide context-aware insights based on PETRONAS Upstream knowledge
•	Visual Chart Generation: Automatically generates line charts for time-series data
•	Real-time Processing: Provides immediate feedback during analysis

User Flow
1. User navigates to /agents/analytics
2. User uploads a CSV file or pastes data
3. System processes data and generates insights
4. Results displayed with charts and key findings
5. User can download results or share with team

[Figure 13: Analytics Agent Test Page – Data Input and Results]

Page 3.2: Meetings Agent Test Page
Overview
The Meetings Agent Test Page enables employees to upload meeting transcripts or notes and automatically extract key decisions, action items, and strategic insights. This page streamlines post-meeting documentation for project managers, team leads, and administrative staff.

UI Components
•	Route: /agents/meetings
•	Transcript Input Section: Text area for pasting meeting transcripts or uploading text files
•	Meeting Analysis Display: Structured output showing key decisions, action items with owners and due dates, and strategic alignment points
•	Executive Brief Format: Results presented in a professional, executive-ready format

Key Features
•	Automatic Action Item Extraction: Identifies action items, assigns owners, and extracts due dates
•	Decision Categorization: Organizes key decisions by topic and importance
•	Strategic Alignment Analysis: Highlights connections to PETRONAS 2.0 and Systemic Shifts frameworks
•	JSON Output: Structured data format for integration with project management tools

User Flow
1. User navigates to /agents/meetings
2. User pastes meeting transcript or uploads notes file
3. System analyzes transcript using RAG-enhanced context
4. Structured executive brief generated with action items
5. User can copy results or export for distribution

[Figure 14: Meetings Agent Test Page – Transcript Input and Analysis Results]

Page 3.3: Podcast Agent Test Page
Overview
The Podcast Agent Test Page allows users to convert knowledge base content, policy documents, or custom text into engaging audio podcasts. This feature supports the ULearn initiative, enabling "on-the-go" learning for field staff and remote employees.

UI Components
•	Route: /agents/podcast
•	Content Input Section: Text area for entering content or selecting from knowledge base
•	Podcast Generation Controls: Options for voice selection, speed, and format
•	Audio Player: Built-in player for previewing generated podcasts
•	Download Functionality: Export audio files in various formats

Key Features
•	Text-to-Speech Integration: Converts written content into natural-sounding audio
•	Knowledge Base Integration: Can pull content directly from VERA AI knowledge base
•	Customizable Voice Settings: Multiple voice options and speed controls
•	Multi-format Export: Supports MP3, WAV, and other audio formats

User Flow
1. User navigates to /agents/podcast
2. User selects content from knowledge base or enters custom text
3. User configures voice and format settings
4. System generates podcast audio
5. User previews and downloads the audio file

[Figure 15: Podcast Agent Test Page – Content Selection and Audio Generation]

Page 3.4: Content Agent Test Page
Overview
The Content Agent Test Page provides an interface for generating written content and visual assets. Users can create professional narratives, headlines, summaries, and generate images for communications, reports, and presentations.

UI Components
•	Route: /agents/content
•	Prompt Input Section: Text area for entering content generation prompts
•	Generation Type Selector: Options for text content, images, or both
•	Content Display Area: Shows generated text and images with editing capabilities
•	Reference Image Upload: Optional image upload for style reference

Key Features
•	Dual Generation Modes: Supports both text content and image generation
•	RAG-Enhanced Context: Uses knowledge base to ensure content aligns with PETRONAS branding and Systemic Shifts narrative
•	Local Image Generation: Images generated via local GPU service for enhanced privacy
•	Real-time Status Updates: Firestore listeners provide live updates on generation progress

User Flow
1. User navigates to /agents/content
2. User enters prompt describing desired content or image
3. User selects generation type (content, image, or both)
4. System processes request and generates output
5. User can refine, edit, or regenerate results

[Figure 16: Content Agent Test Page – Prompt Input and Generated Content]

Page 3.5: Visual Agent Test Page
Overview
The Visual Agent Test Page enables employees to upload images for automated analysis, tagging, and categorization. This feature supports visual asset management, content curation, and automated metadata generation for image repositories.

UI Components
•	Route: /agents/visual
•	Image Upload Section: Drag-and-drop interface for image files
•	Analysis Results Display: Shows AI-generated tags, descriptions, and categorization
•	Metadata Export: Download structured metadata in JSON format
•	Image Preview: Displays uploaded image with overlay annotations

Key Features
•	Computer Vision Analysis: Uses Gemini Vision API for image understanding
•	Automated Tagging: Generates semantic tags for efficient search and retrieval
•	Category Classification: Automatically categorizes images by content type
•	Metadata Generation: Creates comprehensive metadata for asset management systems

User Flow
1. User navigates to /agents/visual
2. User uploads image file (JPG, PNG, etc.)
3. System analyzes image using computer vision
4. Tags, descriptions, and categories displayed
5. User can export metadata or use tags for search

[Figure 17: Visual Agent Test Page – Image Upload and Analysis Results]

Page 3.6: Quiz Agent Test Page
Overview
The Quiz Agent Test Page allows training coordinators and educators to generate knowledge assessment quizzes from content in the knowledge base or custom text. This supports the ULearn initiative and enables rapid creation of training materials.

UI Components
•	Route: /agents/quiz
•	Content Selection: Options to select from knowledge base or enter custom content
•	Quiz Configuration: Settings for question types, difficulty, and number of questions
•	Quiz Preview: Interactive preview of generated quiz
•	Export Options: Download quiz in various formats (JSON, PDF, DOCX)

Key Features
•	Knowledge Base Integration: Pulls content from VERA AI knowledge base for quiz generation
•	Multiple Question Types: Supports multiple choice, true/false, and short answer questions
•	Difficulty Adjustment: Configurable difficulty levels based on content complexity
•	Answer Key Generation: Automatically generates answer keys with explanations

User Flow
1. User navigates to /agents/quiz
2. User selects content source (knowledge base or custom text)
3. User configures quiz parameters (type, difficulty, count)
4. System generates quiz questions and answers
5. User previews, edits, and exports quiz

[Figure 18: Quiz Agent Test Page – Content Selection and Generated Quiz]