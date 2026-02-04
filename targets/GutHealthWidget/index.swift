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
        if entry.data.score >= 70 { return yellow } // Vibing (Yellow)
        return blue                                 // Sus/SOS (Blue)
    }
    
    // Fix contrast: use white text on green background
    var gradeTextColor: Color {
        if entry.data.score >= 90 { return white }
        return pink
    }
    
    // 🔥 Fun grade based on score (TikTok-viral)
    var funGrade: String {
        if entry.data.score >= 90 { return "Thriving 🌟" }
        if entry.data.score >= 80 { return "Vibing ✨" }
        if entry.data.score >= 70 { return "Mid 😐" }
        if entry.data.score >= 50 { return "Sus 👀" }
        return "SOS 🆘"
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
    
    // MARK: - Small Layout (Whimsical Card)
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
                
                // Big Score center
                HStack(alignment: .lastTextBaseline, spacing: 2) {
                    Text("\(entry.data.score)")
                        .font(cheeryFont(size: 64))
                        .foregroundColor(black)
                        .shadow(color: black.opacity(0.05), radius: 0, x: 2, y: 2)
                    
                    Text(funGrade)
                        .font(cheeryFont(size: 18))
                        .foregroundColor(gradeTextColor)
                        .rotationEffect(.degrees(-10))
                }
                .padding(.leading, 14)
                .padding(.bottom, 4)
                
                Spacer()
                
                // Footer
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("LAST 💩")
                            .font(bodyFont(size: 10, weight: .bold))
                            .foregroundColor(black.opacity(0.4))
                        Text(entry.data.lastPoopTime)
                            .font(cheeryFont(size: 14))
                            .foregroundColor(black)
                    }
                    Spacer()
                }
                .padding(14)
            }
            
            // Mascot Peeking Overlay
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    SafeMascotImage(score: entry.data.score)
                        .frame(width: 80, height: 80)
                        .rotationEffect(.degrees(10))
                        .offset(x: 10, y: 10)
                }
            }
        }
    }
    
    // MARK: - Medium Layout (Split Card)
    var mediumLayout: some View {
        HStack(spacing: 0) {
            // LEFT: Solid Color Block (Uses Container Background)
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
                }
                .padding(16)
                
                // Centered Score
                Text("\(entry.data.score)")
                    .font(cheeryFont(size: 64))
                    .foregroundColor(black)
                    .shadow(color: black.opacity(0.1), radius: 0, x: 2, y: 3)
            }
            .frame(width: 140) // Fixed width for left side
            .zIndex(1) // Keep below mascot
            
            // RIGHT: Stats & Chart
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
                        statItem(label: "VIBE", value: funGrade)
                    }
                }
                .padding(18)
                .padding(.leading, 24) // Extra padding for mascot overlap
            }
            .frame(maxWidth: .infinity)
            .overlay(
                 // Mascot Overlapping the middle line
                SafeMascotImage(score: entry.data.score)
                    .frame(width: 80, height: 80)
                    .offset(x: -32, y: 20), // Left offset to straddle the line
                alignment: .bottomLeading
            )
            .zIndex(2) // Above left side
        }
    }
    
    // MARK: - Large Layout (Playful Dashboard)
    var largeLayout: some View {
        ZStack {
            // Transparent base to show containerBackground
            Color.clear
            
                VStack(spacing: 0) {
                 // Header Area (Compact Top)
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("HELLO!")
                            .font(bodyFont(size: 12, weight: .bold))
                            .foregroundColor(black.opacity(0.4))
                            .tracking(1.5)
                        
                        Text("Your Gut Score")
                            .font(cheeryFont(size: 24))
                            .foregroundColor(black)
                    }
                    Spacer()
                    
                    // Score with Mascot
                    HStack(spacing: 8) {
                        Text("\(entry.data.score)")
                            .font(cheeryFont(size: 42))
                            .foregroundColor(black)
                        
                        SafeMascotImage(score: entry.data.score)
                            .frame(width: 48, height: 48)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)
                
                // White Card Body (Fills remaining space)
                ZStack(alignment: .top) {
                    white
                        .cornerRadius(24) // Rounds all, but bottom is hidden
                    
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
                                                .frame(height: min(CGFloat(point.count) * 10 + 6, 54)) // Cap bar height to prevent overlap
                                            
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
                        
                         // Footer Stats
                        HStack {
                            statItem(label: "LAST 💩", value: entry.data.lastPoopTime)
                            Spacer()
                            statItem(label: "VIBE", value: funGrade)
                            Spacer() 
                        }
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
        let hasRecentPoop = lastPoop.contains("ago") || lastPoop == "Just now" || lastPoop.contains("h") || lastPoop.contains("m")
        
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

// MARK: - Safe Image Loader
struct SafeMascotImage: View {
    let score: Int
    
    var imageName: String {
        if score >= 80 { return "happy-baloon.png" }
        if score >= 50 { return "happy-clap.png" }
        return "sad-cry.png"
    }
    
    var body: some View {
        // Try to load keeping in mind it might be a loose file
        if let uiImage = UIImage(named: imageName) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFit()
        } else {
            // Fallback debugging circle
            Circle()
                .fill(Color.gray.opacity(0.3))
                .overlay(Text("?").font(.caption))
        }
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