from __future__ import annotations

import argparse
import sys
import types
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


TOPIC_MAPPING = {
    2: "Coercive Control",
    3: "Coercive Control",
    4: "Neglect",
    6: "Coercive Control",
    8: "Verbal/Emotional Abuse",
    1: "Neglect",
    5: "Verbal/Emotional Abuse",
}


def load_topic_model(model_dir: Path):
    import transformers.models.bert.modeling_bert as modeling_bert
    import transformers.models.bert.tokenization_bert as tokenization_bert

    if not hasattr(modeling_bert, "BertSdpaSelfAttention"):
        modeling_bert.BertSdpaSelfAttention = modeling_bert.BertSelfAttention

    fake_fast_module = types.ModuleType("transformers.models.bert.tokenization_bert_fast")
    fake_fast_module.BertTokenizerFast = getattr(tokenization_bert, "BertTokenizerFast", tokenization_bert.BertTokenizer)
    sys.modules["transformers.models.bert.tokenization_bert_fast"] = fake_fast_module

    from bertopic import BERTopic

    return BERTopic.load(str(model_dir))


def build_output_dirs(base_dir: Path) -> Path:
    graphs_dir = base_dir / "docs" / "graphs"
    graphs_dir.mkdir(parents=True, exist_ok=True)
    return graphs_dir


def save_bar_chart(title: str, subtitle: str, labels: list[str], values: list[int], colors: list[str], output_path: Path, xlabel: str = "Count"):
    fig, ax = plt.subplots(figsize=(12, 7))
    sns.barplot(x=values, y=labels, ax=ax, palette=colors)
    ax.set_title(title, fontsize=18, weight="bold", pad=16)
    ax.set_xlabel(xlabel, fontsize=12)
    ax.set_ylabel("")
    ax.grid(axis="x", alpha=0.2)
    ax.set_axisbelow(True)
    fig.text(0.125, 0.02, subtitle, ha="left", va="bottom", fontsize=10, color="#555555")
    plt.tight_layout(rect=(0, 0.03, 1, 1))
    fig.savefig(output_path, dpi=220, bbox_inches="tight")
    plt.close(fig)


def save_topic_word_panels(topic_model, topic_rows, output_path: Path, max_topics: int = 4, max_words: int = 8):
    selected_rows = topic_rows[topic_rows["Topic"] != -1].head(max_topics)
    if selected_rows.empty:
        selected_rows = topic_rows.head(max_topics)

    fig, axes = plt.subplots(len(selected_rows), 1, figsize=(12, 3.6 * len(selected_rows)))
    if len(selected_rows) == 1:
        axes = [axes]

    for ax, row in zip(axes, selected_rows.itertuples(index=False)):
        topic_id = int(row.Topic)
        terms = topic_model.get_topic(topic_id) or []
        words = [term for term, _ in terms[:max_words]][::-1]
        weights = [weight for _, weight in terms[:max_words]][::-1]
        colors = sns.color_palette("crest", len(words))
        ax.barh(words, weights, color=colors)
        ax.set_title(f"Topic {topic_id}: {row.Name}", fontsize=14, weight="bold")
        ax.set_xlabel("Weight")
        ax.set_ylabel("")
        ax.grid(axis="x", alpha=0.2)

    fig.suptitle("Top Words per Topic", fontsize=18, weight="bold", y=1.01)
    plt.tight_layout()
    fig.savefig(output_path, dpi=220, bbox_inches="tight")
    plt.close(fig)


def generate_graphs(base_dir: Path):
    data_path = base_dir / "vawc_dataset.csv"
    model_path = base_dir / "vawc_bertopic_model"
    graphs_dir = build_output_dirs(base_dir)

    pd.read_csv(data_path)
    topic_model = load_topic_model(model_path)
    topic_info = topic_model.get_topic_info().copy()

    topic_info = topic_info.sort_values("Count", ascending=False).reset_index(drop=True)

    topic_counts = Counter(dict(zip(topic_info["Topic"], topic_info["Count"])))
    raw_topics = [topic for topic in topic_info["Topic"]]
    raw_counts = [topic_counts[topic] for topic in raw_topics]
    raw_labels = [f"Topic {topic}" if topic != -1 else "Outlier (-1)" for topic in raw_topics]
    raw_colors = ["#9aa5b1" if topic == -1 else "#2a9d8f" for topic in raw_topics]

    save_bar_chart(
        title="BERTopic Raw Topic Distribution",
        subtitle="Counts come from the saved BERTopic model trained on 539 relationship-text samples.",
        labels=raw_labels[::-1],
        values=raw_counts[::-1],
        colors=raw_colors[::-1],
        output_path=graphs_dir / "raw_topic_distribution.png",
    )

    category_counts = Counter()
    for row in topic_info.itertuples(index=False):
        category = TOPIC_MAPPING.get(int(row.Topic), "Unmapped / Fallback")
        category_counts[category] += int(row.Count)

    category_order = [
        "Coercive Control",
        "Verbal/Emotional Abuse",
        "Neglect",
        "Unmapped / Fallback",
    ]
    category_labels = [label for label in category_order if label in category_counts]
    category_values = [category_counts[label] for label in category_labels]
    category_colors = ["#e76f51", "#f4a261", "#2a9d8f", "#6c757d"][: len(category_labels)]

    save_bar_chart(
        title="Mapped ML Category Distribution",
        subtitle="Raw topic IDs are consolidated into the business-facing categories used by the API.",
        labels=category_labels[::-1],
        values=category_values[::-1],
        colors=category_colors[::-1],
        output_path=graphs_dir / "mapped_category_distribution.png",
    )

    save_topic_word_panels(topic_model, topic_info, graphs_dir / "top_words_by_topic.png")

    summary_lines = [
        "# ML Graphs",
        "",
        "Use these figures in the documentation for the ProtectEd ML service.",
        "",
        "## Generated Assets",
        "",
        "- `graphs/raw_topic_distribution.png` - frequency of each BERTopic topic.",
        "- `graphs/mapped_category_distribution.png` - business category counts after applying the API mapping.",
        "- `graphs/top_words_by_topic.png` - top words for the most frequent topics.",
        "",
        "## Topic Summary",
        "",
        "| Topic | Count | Mapped Category |",
        "| --- | ---: | --- |",
    ]

    for row in topic_info.itertuples(index=False):
        mapped_category = TOPIC_MAPPING.get(int(row.Topic), "Unmapped / Fallback")
        summary_lines.append(f"| {int(row.Topic)} | {int(row.Count)} | {mapped_category} |")

    summary_path = graphs_dir.parent / "ml_graphs.md"
    summary_path.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")

    return graphs_dir, summary_path


def main():
    parser = argparse.ArgumentParser(description="Generate documentation graphs for the ML service.")
    parser.add_argument(
        "--base-dir",
        default=str(Path(__file__).resolve().parent),
        help="Path to the ML_service directory.",
    )
    args = parser.parse_args()

    base_dir = Path(args.base_dir).resolve()
    graphs_dir, summary_path = generate_graphs(base_dir)
    print(f"Generated graphs in: {graphs_dir}")
    print(f"Generated summary file: {summary_path}")


if __name__ == "__main__":
    main()