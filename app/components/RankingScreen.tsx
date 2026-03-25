"use client";

interface Props {
  bestScore: number;
  onHome: () => void;
}

const FAKE_PLAYERS = [
  { name: "Eigo_Master99", score: 5240 },
  { name: "TOEIC_King", score: 4870 },
  { name: "英語の達人", score: 4520 },
  { name: "QuizBlitz_JP", score: 4180 },
  { name: "TanakaTOEIC", score: 3950 },
  { name: "HanakoChan", score: 3720 },
  { name: "単語王2025", score: 3480 },
  { name: "英単語bot", score: 3150 },
  { name: "StudyHardGuy", score: 2890 },
  { name: "NightOwl777", score: 2640 },
];

export default function RankingScreen({ bestScore, onHome }: Props) {
  const allPlayers = [...FAKE_PLAYERS, { name: "YOU", score: bestScore }]
    .sort((a, b) => b.score - a.score);

  const myRank = allPlayers.findIndex((p) => p.name === "YOU") + 1;

  const rankColor = (rank: number) =>
    rank === 1 ? "text-yellow-300" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-orange-400" : "text-gray-400";

  const rankBg = (name: string) =>
    name === "YOU" ? "bg-indigo-900 ring-2 ring-indigo-400" : "bg-gray-800";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black">🏆 ランキング</h1>
        <p className="text-gray-400 text-sm mt-1">ベストスコアで競え</p>
      </div>

      {bestScore === 0 && (
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-6 text-center text-gray-400 text-sm">
          クイズをプレイするとランキングに載ります
        </div>
      )}

      {bestScore > 0 && (
        <div className="w-full max-w-sm bg-indigo-900 rounded-2xl p-4 mb-6 text-center ring-2 ring-indigo-400">
          <div className="text-xs text-indigo-300">あなたの順位</div>
          <div className="text-4xl font-black text-white">{myRank}位</div>
          <div className="text-yellow-300 font-bold">{bestScore.toLocaleString()} pt</div>
        </div>
      )}

      <div className="w-full max-w-sm space-y-2">
        {allPlayers.map((player, i) => {
          const rank = i + 1;
          return (
            <div
              key={player.name}
              className={`flex items-center gap-3 ${rankBg(player.name)} rounded-xl px-4 py-3`}
            >
              <div className={`text-lg font-black w-8 text-center ${rankColor(rank)}`}>
                {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
              </div>
              <div className="flex-1 font-semibold">
                {player.name === "YOU" ? (
                  <span className="text-indigo-300">▶ {player.name}</span>
                ) : (
                  player.name
                )}
              </div>
              <div className="font-bold text-yellow-300">{player.score.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onHome}
        className="mt-8 w-full max-w-sm py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition"
      >
        ホームへ
      </button>
    </div>
  );
}
