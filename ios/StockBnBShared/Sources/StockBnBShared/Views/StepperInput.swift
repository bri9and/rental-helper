import SwiftUI

public struct StepperInput: View {
    @Binding var value: Int
    let minimum: Int
    let maximum: Int

    public init(value: Binding<Int>, minimum: Int = 0, maximum: Int = 999) {
        self._value = value
        self.minimum = minimum
        self.maximum = maximum
    }

    public var body: some View {
        HStack(spacing: 0) {
            Button {
                if value > minimum {
                    value -= 1
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
            } label: {
                Image(systemName: "minus")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(value > minimum ? .primary : .secondary)
                    .frame(width: 44, height: 44)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            .disabled(value <= minimum)

            TextField("", value: $value, format: .number)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .frame(width: 60, height: 44)
                .background(Color(.systemGray6))

            Button {
                if value < maximum {
                    value += 1
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.green)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            .disabled(value >= maximum)
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var count = 5
        var body: some View {
            StepperInput(value: $count)
                .padding()
        }
    }
    return PreviewWrapper()
}
