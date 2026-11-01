# Research figure data

Rebuild from the repository root:

```sh
python -m pip install matplotlib
python tools/generate_research_charts.py
```

The seven SVGs are Matplotlib plots, not generated artwork. Each has a CSV and an entry in chart-manifest.json.

- Memory: the saved synthetic experiment from 18 October 2026. memory-benchmark.json preserves the source URL, runtime and fixture hashes, configuration and six method aggregates. This is not a rerun of current Q-MDM code.
- ESP32: externally reported Whistle model sizes and a single timing example from the independent whistle-esp32 port. Flash capacities are computed in decimal MB from 16 MiB and the published 0x210000 model offset. These are not Omansh's device measurements.
- Hallucinative LLM: a probability identity with assumed p and independent candidates. This does not measure creativity, novelty or model accuracy.
- Manufacturing: reward coefficients read from Fab Yield Agent environment/env.py at commit 0732e65711cdb6000db1b82c0cc95138861b1315. Coefficients are not realized reward shares or training results.
- Semiconductor: a plot of the fixed twelve-step rule. It does not show learned performance.

Do not replace analytical illustrations or third-party reports with claims of measured project improvements. New experimental results need their own inputs, configuration and evaluation records.
