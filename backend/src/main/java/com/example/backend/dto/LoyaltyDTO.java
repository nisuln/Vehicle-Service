package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyDTO {

    /** Total completed (non-cancelled) service orders for this customer */
    private int totalCompleted;

    /** How many services into the current cycle (0-4) */
    private int cycleProgress;

    /** How many more services until the next free one */
    private int servicesUntilFree;

    /** Whether the customer currently has a free service reward ready to use */
    private boolean freeServiceReady;

    /** How many free services the customer has earned in total (completed cycles) */
    private int totalFreeServicesEarned;

    /** Friendly message to show the user */
    private String message;

    /** Cycle size — always 5 */
    private static final int CYCLE = 5;

    public static LoyaltyDTO calculate(int totalCompleted) {
        int cycleProgress    = totalCompleted % CYCLE;          // 0-4 within current cycle
        int completedCycles  = totalCompleted / CYCLE;          // full cycles done
        boolean freeReady    = cycleProgress == 0 && totalCompleted > 0; // just finished a cycle
        int untilFree        = freeReady ? 0 : CYCLE - cycleProgress;

        String message;
        if (freeReady) {
            message = "🎉 Your 6th service is FREE! Book now to claim your reward.";
        } else if (untilFree == 1) {
            message = "⭐ Just 1 more service until your FREE service reward!";
        } else {
            message = "✨ Complete " + untilFree + " more services to earn a FREE service!";
        }

        return LoyaltyDTO.builder()
                .totalCompleted(totalCompleted)
                .cycleProgress(cycleProgress)
                .servicesUntilFree(untilFree)
                .freeServiceReady(freeReady)
                .totalFreeServicesEarned(completedCycles)
                .message(message)
                .build();
    }
}