import WidgetKit
import SwiftUI

// MARK: - Data Models
struct HistoryPoint: Codable {
    let date: String
    let count: Int
    let label: String?
}

struct GutHealthData: Codable {
    let score: Int
    let grade: String
    let lastPoopTime: String
    let statusMessage: String
    let breakdown: [String: Int]?
    let weeklyHistory: [HistoryPoint]?
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: GutHealthData
}

// MARK: - Provider
struct Provider: TimelineProvider {
    typealias Entry = SimpleEntry
    let groupIdentifier = "group.com.foodhabit.app"
    let dataKey = "gut_health_data"

    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), data: GutHealthData(score: 85, grade: "A", lastPoopTime: "2h ago", statusMessage: "Doing great!", breakdown: nil, weeklyHistory: nil))
    }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> ()) {
        let data = loadData() ?? GutHealthData(score: 85, grade: "A", lastPoopTime: "2h ago", statusMessage: "Doing great!", breakdown: nil, weeklyHistory: nil)
        completion(Entry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let data = loadData() ?? GutHealthData(score: 50, grade: "Fair", lastPoopTime: "No data", statusMessage: "Open app to sync", breakdown: nil, weeklyHistory: nil)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [Entry(date: Date(), data: data)], policy: .after(nextUpdate)))
    }
    
    private func loadData() -> GutHealthData? {
        if let userDefaults = UserDefaults(suiteName: groupIdentifier),
           let jsonData = userDefaults.string(forKey: dataKey)?.data(using: .utf8) {
            do {
                return try JSONDecoder().decode(GutHealthData.self, from: jsonData)
            } catch {
                print("Error decoding: \(error)")
            }
        }
        return nil
    }
}

// MARK: - Views
struct FoodHabitWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    // 🎨 Theme Colors
    let yellow = Color(hex: "FCE762")
    let pink = Color(hex: "FF7495")
    let blue = Color(hex: "70CFFF")
    let black = Color(hex: "2D2D2D")
    let white = Color.white
    let green = Color(hex: "059669")
    
    var scoreColor: Color {
        if entry.data.score >= 90 { return green }  // Thriving (Green)
        if entry.data.score >= 80 { return yellow } // Vibing (Yellow)
        if entry.data.score >= 70 { return blue }   // Mid (Blue)
        if entry.data.score >= 50 { return pink }   // Sus (Pink)
        return Color(hex: "FF4444")                 // SOS (Red)
    }
    
    // Fix contrast: use black text on lighter backgrounds, white on green
    var gradeTextColor: Color {
        if entry.data.score >= 90 { return white }
        return black.opacity(0.7)
    }
    
    // 🔥 Grade based on score
    var funGrade: String {
        if entry.data.score >= 90 { return "Optimal" }
        if entry.data.score >= 80 { return "Good" }
        if entry.data.score >= 70 { return "Moderate" }
        if entry.data.score >= 50 { return "Concerning" }
        return "Critical"
    }
    
    // 🔤 Font Helpers
    func cheeryFont(size: CGFloat) -> Font {
        .custom("Fredoka-Bold", size: size)
    }
    
    func bodyFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        if weight == .bold {
            return .custom("Fredoka-Bold", size: size)
        }
        return .custom("Fredoka-Regular", size: size)
    }

    var body: some View {
        ZStack {
            switch family {
            case .systemSmall:
                smallLayout
            case .systemMedium:
                mediumLayout
            case .systemLarge:
                largeLayout
            default:
                smallLayout
            }
        }
        .widgetURL(URL(string: "foodhabit://home"))
        .applyWidgetBackground(scoreColor)
    }
    
    // MARK: - Small Layout (Score Card)
    var smallLayout: some View {
        ZStack {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    Text("GUT SCORE")
                        .font(cheeryFont(size: 16))
                        .foregroundColor(black.opacity(0.6))
                        .tracking(1)
                    Spacer()
                }
                .padding(.top, 14)
                .padding(.horizontal, 14)

                Spacer()

                // Score Ring and Info
                HStack(spacing: 16) {
                    CircularProgressRing(
                        score: entry.data.score,
                        size: 80,
                        strokeWidth: 5,
                        color: scoreColor
                    )

                    VStack(alignment: .leading, spacing: 8) {
                        // Grade
                        VStack(alignment: .leading, spacing: 2) {
                            Text("GRADE")
                                .font(bodyFont(size: 10, weight: .bold))
                                .foregroundColor(black.opacity(0.4))
                            Text(funGrade)
                                .font(cheeryFont(size: 14))
                                .foregroundColor(black)
                        }

                        // Last Poop
                        VStack(alignment: .leading, spacing: 2) {
                            Text("LAST 💩")
                                .font(bodyFont(size: 10, weight: .bold))
                                .foregroundColor(black.opacity(0.4))
                            Text(entry.data.lastPoopTime)
                                .font(cheeryFont(size: 14))
                                .foregroundColor(black)
                        }
                    }

                    Spacer()
                }
                .padding(.horizontal, 14)
                .padding(.bottom, 14)
            }
        }
    }
    
    // MARK: - Medium Layout (Split Card)
    var mediumLayout: some View {
        HStack(spacing: 0) {
            // LEFT: Score Ring
            ZStack {
                Color.clear // Transparent to show containerBackground

                VStack {
                    HStack {
                        Text("Gut Score")
                            .font(cheeryFont(size: 14))
                            .foregroundColor(black.opacity(0.5))
                            .tracking(1)
                        Spacer()
                    }
                    Spacer()

                    CircularProgressRing(
                        score: entry.data.score,
                        size: 100,
                        strokeWidth: 6,
                        color: scoreColor
                    )

                    Spacer()
                }
                .padding(16)
            }
            .frame(width: 140) // Fixed width for left side
            .zIndex(1)

            // RIGHT: Stats & Details
            ZStack {
                white
                VStack(alignment: .leading, spacing: 14) {
                    // Fun Insight
                    HStack {
                        Text(funInsightMessage(score: entry.data.score, lastPoop: entry.data.lastPoopTime))
                            .font(cheeryFont(size: 14))
                            .foregroundColor(black)
                            .multilineTextAlignment(.leading)
                            .lineLimit(3)
                        Spacer()
                    }

                    Divider()

                    // Stats Row
                    HStack(spacing: 20) {
                        statItem(label: "LAST 💩", value: entry.data.lastPoopTime)
                        statItem(label: "GRADE", value: funGrade)
                    }
                }
                .padding(18)
            }
            .frame(maxWidth: .infinity)
            .zIndex(2)
        }
    }
    
    // MARK: - Large Layout (Dashboard)
    var largeLayout: some View {
        ZStack {
            // Transparent base to show containerBackground
            Color.clear

            VStack(spacing: 0) {
                // Header Area with Score Ring
                HStack(alignment: .center, spacing: 20) {
                    CircularProgressRing(
                        score: entry.data.score,
                        size: 100,
                        strokeWidth: 6,
                        color: scoreColor
                    )

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Your Gut Score")
                            .font(cheeryFont(size: 24))
                            .foregroundColor(black)

                        VStack(alignment: .leading, spacing: 6) {
                            statItem(label: "GRADE", value: funGrade)
                            statItem(label: "LAST 💩", value: entry.data.lastPoopTime)
                        }
                    }

                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)

                // White Card Body (Fills remaining space)
                ZStack(alignment: .top) {
                    white
                        .cornerRadius(24)

                    VStack(alignment: .leading, spacing: 18) {
                        // Insight Text
                        Text(funInsightMessage(score: entry.data.score, lastPoop: entry.data.lastPoopTime))
                            .font(cheeryFont(size: 18))
                            .foregroundColor(black)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)

                        // Stats & Chart
                        VStack(alignment: .leading, spacing: 10) {
                            Text("THIS WEEK")
                                .font(bodyFont(size: 10, weight: .bold))
                                .foregroundColor(black.opacity(0.4))
                                .tracking(1)

                            HStack(alignment: .bottom, spacing: 8) {
                                if let history = entry.data.weeklyHistory {
                                    ForEach(history.suffix(7), id: \.date) { point in
                                        VStack(spacing: 4) {
                                            RoundedRectangle(cornerRadius: 6)
                                                .fill(point.count > 0 ? pink : black.opacity(0.05))
                                                .frame(height: min(CGFloat(point.count) * 10 + 6, 54))

                                            Text(point.label ?? "S")
                                                .font(cheeryFont(size: 10))
                                                .foregroundColor(black.opacity(0.4))
                                        }
                                        .frame(maxWidth: .infinity)
                                    }
                                }
                            }
                            .frame(height: 66)
                        }

                        Spacer()
                    }
                    .padding(24)
                }
                .edgesIgnoringSafeArea(.bottom)
            }
        }
    }
    
    // MARK: - Components
    func scoreMessage(score: Int) -> String {
         // Keep simple status for badges if needed, or remove if unused.
         // We'll use the fun message for the main text.
        if score >= 80 { return "Excellent" }
        if score >= 50 { return "Good" }
        return "Poor"
    }
    
    func funInsightMessage(score: Int, lastPoop: String) -> String {
        // 🔥 TikTok-viral insight messages
        if score >= 90 {
            let messages = [
                "Your gut is giving main character energy ✨",
                "Microbiome said: slay! 💅",
                "Your intestines deserve an award 🏆",
                "Gut health? More like gut WEALTH 💰"
            ]
            return messages[abs(score.hashValue) % messages.count]
        }
        
        if score >= 80 {
            let messages = [
                "Your gut is vibing fr fr 🎵",
                "Solid performance! (Literally) 🧻",
                "Your microbiome is in its happy era 🌈",
                "Keep this energy going! 🚀"
            ]
            return messages[abs(score.hashValue) % messages.count]
        }
        
        if score >= 70 {
            let messages = [
                "Not bad, not amazing. Very mid 😐",
                "Your gut is in its chill era 🧘",
                "Room for improvement, bestie 📈",
                "Average but make it digestive 🤷"
            ]
            return messages[abs(score.hashValue) % messages.count]
        }
        
        if score >= 50 {
            let messages = [
                "Something's sus in there 👀",
                "Your gut is plotting something...",
                "The vibes are... off today 😬",
                "Your colon is writing a complaint letter �"
            ]
            return messages[abs(score.hashValue) % messages.count]
        }
        
        // SOS tier
        let messages = [
            "Houston, we have a problem 🚨",
            "Your gut is NOT having it today 😤",
            "Emergency vibes only! Code brown! 🆘",
            "Your intestines just rage quit 💀"
        ]
        return messages[abs(score.hashValue) % messages.count]
    }

    func statItem(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(bodyFont(size: 10, weight: .bold))
                .foregroundColor(black.opacity(0.4))
            Text(value)
                .font(cheeryFont(size: 18))
                .foregroundColor(black)
        }
    }
}

// MARK: - Circular Progress Ring
struct CircularProgressRing: View {
    let score: Int
    let size: CGFloat
    let strokeWidth: CGFloat
    let color: Color

    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(Color.black.opacity(0.1), lineWidth: strokeWidth)

            // Progress circle
            Circle()
                .trim(from: 0, to: CGFloat(score) / 100)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [color, color.opacity(0.6)]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            // Center text
            VStack(spacing: 2) {
                Text("GUT")
                    .font(.system(size: 10, weight: .semibold, design: .default))
                    .foregroundColor(Color.black.opacity(0.6))
                    .tracking(0.5)

                Text("\(score)")
                    .font(.system(size: 32, weight: .bold, design: .default))
                    .foregroundColor(Color.black)
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Compatibility Helpers
extension View {
    @ViewBuilder
    func applyWidgetBackground(_ backgroundView: some View) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                backgroundView
            }
        } else {
            self.background(backgroundView)
        }
    }
}

extension WidgetConfiguration {
    func disableContentMargins() -> some WidgetConfiguration {
        #if compiler(>=5.9)
        if #available(iOS 17.0, *) {
            return self.contentMarginsDisabled()
        }
        #endif
        return self
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

@main
struct GutHealthWidgetBundle: WidgetBundle {
    var body: some Widget {
        GutHealthWidget()
    }
}

struct GutHealthWidget: Widget {
    let kind: String = "GutHealthWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            FoodHabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Gut Buddy")
        .description("Keep your gut happy!")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .disableContentMargins()
    }
}