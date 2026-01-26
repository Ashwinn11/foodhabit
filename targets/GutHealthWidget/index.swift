import WidgetKit
import SwiftUI

struct HistoryPoint: Codable {
    let date: String
    let count: Int
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

struct Provider: TimelineProvider {
    typealias Entry = SimpleEntry
    let groupIdentifier = "group.com.foodhabit.app"
    let dataKey = "gut_health_data"

    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), data: GutHealthData(score: 85, grade: "A", lastPoopTime: "2h ago", statusMessage: "Great job!", breakdown: nil, weeklyHistory: nil))
    }

    func getSnapshot(in context: Context, completion: @escaping (Entry) -> ()) {
        let data = loadData() ?? GutHealthData(score: 85, grade: "A", lastPoopTime: "2h ago", statusMessage: "Great job!", breakdown: nil, weeklyHistory: nil)
        let entry = Entry(date: Date(), data: data)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let data = loadData() ?? GutHealthData(score: 0, grade: "-", lastPoopTime: "No data", statusMessage: "Open app to sync", breakdown: nil, weeklyHistory: nil)
        
        let currentDate = Date()
        let entry = Entry(date: currentDate, data: data)
        
        // Refresh every 15 minutes or when app requests reload
        let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
        completion(timeline)
    }
    
    private func loadData() -> GutHealthData? {
        if let userDefaults = UserDefaults(suiteName: groupIdentifier),
           let jsonData = userDefaults.string(forKey: dataKey)?.data(using: .utf8) {
            do {
                let decoded = try JSONDecoder().decode(GutHealthData.self, from: jsonData)
                return decoded
            } catch {
                print("Error decoding gut data: \(error)")
            }
        }
        return nil
    }
}

struct FoodHabitWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    // Colors
    let blueColor = Color(red: 0.2, green: 0.6, blue: 1.0)
    let pinkColor = Color(red: 1.0, green: 0.4, blue: 0.7)
    let yellowColor = Color(red: 1.0, green: 0.8, blue: 0.2)
    
    var scoreColor: Color {
        if entry.data.score >= 80 { return blueColor }
        if entry.data.score >= 60 { return yellowColor }
        return pinkColor
    }

    var body: some View {
        ZStack {
            // Soft Gradient Background
            LinearGradient(
                gradient: Gradient(colors: [Color(UIColor.systemBackground), scoreColor.opacity(0.12)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
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
    }
    
    // MARK: - Small Layout (Square)
    var smallLayout: some View {
        VStack(spacing: 0) {
            HStack {
                Text(entry.data.statusMessage)
                    .font(.custom("Fredoka-SemiBold", size: 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                Spacer()
            }
            .padding(.bottom, 8)
            
            Spacer()
            
            scoreCircle(size: 85)
            
            Spacer()
            
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("LAST LOG")
                        .font(.custom("Fredoka-Bold", size: 8))
                        .foregroundColor(.secondary.opacity(0.7))
                    Text(entry.data.lastPoopTime)
                        .font(.custom("Fredoka-SemiBold", size: 12))
                        .foregroundColor(Color(UIColor.label))
                }
                Spacer()
                gradeBadge // Moved to Bottom Right
            }
        }
        .padding(14)
    }
    
    // MARK: - Medium Layout
    var mediumLayout: some View {
        HStack(spacing: 20) {
            GutMascotView(color: scoreColor)
                .frame(width: 100, height: 100)
            
            VStack(alignment: .leading, spacing: 8) {
                Text(entry.data.statusMessage)
                    .font(.custom("Fredoka-Bold", size: 16))
                    .foregroundColor(Color(UIColor.label))
                
                HStack(spacing: 12) {
                    scoreCircle(size: 55)
                    
                    VStack(alignment: .leading, spacing: 1) {
                        Text("LAST LOG")
                            .font(.custom("Fredoka-Bold", size: 8))
                            .foregroundColor(.secondary.opacity(0.7))
                        Text(entry.data.lastPoopTime)
                            .font(.custom("Fredoka-SemiBold", size: 14))
                            .foregroundColor(Color(UIColor.label))
                    }
                }
                
                HStack {
                    Spacer()
                    gradeBadge // Ensure it's right-aligned in its area
                }
            }
            Spacer()
        }
        .padding(16)
    }
    
    // MARK: - Large Layout
    var largeLayout: some View {
        VStack(spacing: 15) {
            Text(entry.data.statusMessage)
                .font(.custom("Fredoka-Bold", size: 22))
                .multilineTextAlignment(.center)
            
            GutMascotView(color: scoreColor)
                .frame(width: 160, height: 160)
                .padding(.vertical, 10)
            
            HStack(spacing: 40) {
                VStack(spacing: 4) {
                    Text("GUT SCORE")
                        .font(.custom("Fredoka-Bold", size: 10))
                        .foregroundColor(.secondary)
                    Text("\(entry.data.score)")
                        .font(.custom("Fredoka-Bold", size: 28))
                        .foregroundColor(scoreColor)
                }
                
                VStack(spacing: 4) {
                    Text("LAST LOG")
                        .font(.custom("Fredoka-Bold", size: 10))
                        .foregroundColor(.secondary)
                    Text(entry.data.lastPoopTime)
                        .font(.custom("Fredoka-Bold", size: 22))
                        .foregroundColor(Color(UIColor.label))
                }
            }
            
            Spacer()
            
            HStack {
                Spacer()
                gradeBadge // Bottom Right
            }
        }
        .padding(24)
    }

    func scoreCircle(size: CGFloat) -> some View {
        ZStack {
            Circle()
                .stroke(scoreColor.opacity(0.15), lineWidth: size * 0.1)
            
            Circle()
                .trim(from: 0, to: CGFloat(entry.data.score) / 100.0)
                .stroke(
                    LinearGradient(colors: [scoreColor, scoreColor.opacity(0.8)], startPoint: .top, endPoint: .bottom),
                    style: StrokeStyle(lineWidth: size * 0.1, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            
            Text("\(entry.data.score)")
                .font(.custom("Fredoka-Bold", size: size * 0.35))
                .foregroundColor(Color(UIColor.label))
        }
        .frame(width: size, height: size)
    }
    
    var gradeBadge: some View {
        Text(entry.data.grade)
            .font(.custom("Fredoka-Bold", size: 10))
            .foregroundColor(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(scoreColor)
                    .shadow(color: scoreColor.opacity(0.3), radius: 2, x: 0, y: 1)
            )
    }
}

// MARK: - Whimsical Mascot View (1:1 SVG Implementation)
struct GutMascotView: View {
    var color: Color
    
    // SVG Colors extrapolated for SwiftUI
    let bodyColor = Color(red: 253/255, green: 114/255, blue: 112/255) // cls-7
    let highlightColor = Color(red: 255/255, green: 151/255, blue: 150/255) // cls-3
    let outlineColor = Color(red: 164/255, green: 6/255, blue: 52/255) // cls-1
    let blushColor = Color(red: 254/255, green: 83/255, blue: 122/255) // cls-6
    let darkColor = Color(red: 94/255, green: 4/255, blue: 28/255) // cls-8

    var body: some View {
        GeometryReader { geo in
            let scale = min(geo.size.width / 345.89, geo.size.height / 434.18)
            
            ZStack {
                let w: CGFloat = 345.89
                let h: CGFloat = 434.18
                
                Group {
                    // Body Shape (Stomach Blob)
                    Path { path in
                        path.move(to: CGPoint(x: 160.94, y: 52.9))
                        path.addCurve(to: CGPoint(x: 65.89, y: 258.27), control1: CGPoint(x: 75.25, y: 68.47), control2: CGPoint(x: 37.32, y: 163.43))
                        path.addCurve(to: CGPoint(x: 79.23, y: 297.08), control1: CGPoint(x: 70.78, y: 274.51), control2: CGPoint(x: 74.35, y: 283.21))
                        path.addCurve(to: CGPoint(x: 73.43, y: 327.68), control1: CGPoint(x: 81.15, y: 302.54), control2: CGPoint(x: 84.98, y: 314.85))
                        path.addCurve(to: CGPoint(x: 51.23, y: 372.49), control1: CGPoint(x: 58.18, y: 344.63), control2: CGPoint(x: 49.82, y: 355.35))
                        path.addCurve(to: CGPoint(x: 70.3, y: 410.3), control1: CGPoint(x: 52.63, y: 389.63), control2: CGPoint(x: 67.32, y: 406.67))
                        path.addCurve(to: CGPoint(x: 92.96, y: 410.68), control1: CGPoint(x: 72.02, y: 412.39), control2: CGPoint(x: 80.08, y: 419.19))
                        path.addCurve(to: CGPoint(x: 101.35, y: 389.78), control1: CGPoint(x: 107.56, y: 401.02), control2: CGPoint(x: 102.82, y: 391.92))
                        path.addCurve(to: CGPoint(x: 94.84, y: 371.99), control1: CGPoint(x: 98.67, y: 385.87), control2: CGPoint(x: 92.29, y: 380.37))
                        path.addCurve(to: CGPoint(x: 144.87, y: 362.71), control1: CGPoint(x: 97.93, y: 361.82), control2: CGPoint(x: 108.88, y: 346.82))
                        path.addCurve(to: CGPoint(x: 225.6, y: 372.91), control1: CGPoint(x: 171.27, y: 374.36), control2: CGPoint(x: 201.16, y: 377.07))
                        path.addCurve(to: CGPoint(x: 320.5, y: 207.03), control1: CGPoint(x: 285.98, y: 362.65), control2: CGPoint(x: 327.09, y: 306.22))
                        path.addCurve(to: CGPoint(x: 160.94, y: 52.9), control1: CGPoint(x: 314.6, y: 118.34), control2: CGPoint(x: 257.15, y: 35.42))
                    }
                    .fill(bodyColor)
                    
                    // Highlight (Smaller Path)
                    Path { path in
                        path.move(to: CGPoint(x: 160.94, y: 52.9))
                        path.addCurve(to: CGPoint(x: 65.89, y: 258.27), control1: CGPoint(x: 75.25, y: 68.47), control2: CGPoint(x: 37.32, y: 163.43))
                        path.addCurve(to: CGPoint(x: 80.25, y: 328.44), control1: CGPoint(x: 70.78, y: 274.51), control2: CGPoint(x: 82.14, y: 310.67))
                        path.addCurve(to: CGPoint(x: 91.96, y: 315.01), control1: CGPoint(x: 80.87, y: 324.28), control2: CGPoint(x: 84.13, y: 319.91))
                        path.addCurve(to: CGPoint(x: 140.88, y: 293.63), control1: CGPoint(x: 106.19, y: 306.1), control2: CGPoint(x: 94.43, y: 298.2))
                        path.addCurve(to: CGPoint(x: 221.61, y: 303.83), control1: CGPoint(x: 168.36, y: 302.45), control2: CGPoint(x: 196.93, y: 315.12))
                        path.addCurve(to: CGPoint(x: 316.51, y: 137.95), control1: CGPoint(x: 281.99, y: 293.57), control2: CGPoint(x: 323.1, y: 237.14))
                        path.addCurve(to: CGPoint(x: 160.94, y: 52.9), control1: CGPoint(x: 314.99, y: 115.06), control2: CGPoint(x: 289.87, y: 69.48))
                    }
                    .fill(highlightColor)
                }
                
                // Blush
                Circle().fill(blushColor).frame(width: w * 0.1).offset(x: -w * 0.25, y: h * 0.05)
                Circle().fill(blushColor).frame(width: w * 0.1).offset(x: w * 0.25, y: -h * 0.05)

                // Eyes
                HStack(spacing: w * 0.3) {
                    ZStack {
                        Circle().fill(darkColor).frame(width: w * 0.1)
                        Circle().fill(.white).frame(width: w * 0.03).offset(x: -2, y: -2)
                    }
                    ZStack {
                        Circle().fill(darkColor).frame(width: w * 0.1)
                        Circle().fill(.white).frame(width: w * 0.03).offset(x: -2, y: -2)
                    }
                }
                .offset(y: -h * 0.08)
                
                // Smile
                Path { path in
                    path.addArc(center: CGPoint(x: w * 0.5, y: h * 0.55), radius: w * 0.1, startAngle: .degrees(0), endAngle: .degrees(180), clockwise: false)
                }
                .stroke(darkColor, style: StrokeStyle(lineWidth: w * 0.03, lineCap: .round))
            }
            .scaleEffect(scale)
            .offset(x: (geo.size.width - 345.89 * scale) / 2, y: (geo.size.height - 434.18 * scale) / 2)
        }
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
        .configurationDisplayName("Gut Score")
        .description("Track your current gut health score.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
