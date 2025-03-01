## URL: https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub

menu

[Skip to\\
\\
content](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub#site-content)

[![Kaggle](https://www.kaggle.com/static/images/site-logo.svg)](https://www.kaggle.com/)

Create

search​

- [explore\\
  \\
  Home](https://www.kaggle.com/)

- [emoji_events\\
  \\
  Competitions](https://www.kaggle.com/competitions)

- [table_chart\\
  \\
  Datasets](https://www.kaggle.com/datasets)

- [tenancy\\
  \\
  Models](https://www.kaggle.com/models)

- [code\\
  \\
  Code](https://www.kaggle.com/code)

- [comment\\
  \\
  Discussions](https://www.kaggle.com/discussions)

- [school\\
  \\
  Learn](https://www.kaggle.com/learn)

- [expand_more\\
  \\
  More](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub#)

auto_awesome_motion

View Active Events

menu

[Skip to\\
\\
content](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub#site-content)

[![Kaggle](https://www.kaggle.com/static/images/site-logo.svg)](https://www.kaggle.com/)

search​

[Sign In](https://www.kaggle.com/account/login?phase=startSignInTab&returnUrl=%2Fcode%2Fkushagrit%2Fpush-dataset-to-huggingface-hub)

[Register](https://www.kaggle.com/account/login?phase=startRegisterTab&returnUrl=%2Fcode%2Fkushagrit%2Fpush-dataset-to-huggingface-hub)

[Kushagri Tandon's profile](https://www.kaggle.com/kushagrit) Kushagri Tandon · 2y ago · 461 views

arrow_drop_up1

[Copy & Edit](https://www.kaggle.com/kernels/fork-version/140568711)7

more_vert

# Push Dataset to Huggingface Hub

## Push Dataset to Huggingface Hub

[Notebook](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub/notebook) [Input](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub/input) [Output](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub/output) [Logs](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub/log) [Comments (0)](https://www.kaggle.com/code/kushagrit/push-dataset-to-huggingface-hub/comments)

historyVersion 2 of 2chevron_right

## Runtime

play_arrow

1m 2s

## Input

DATASETS

![](https://storage.googleapis.com/kaggle-datasets-images/new-version-temp-images/default-backgrounds-6.png-2010701/dataset-thumbnail.png)

bbc-full-text-document-classification

## Language

Python

\_\_notebook\_\_

linkcode

Install Necessary Packages.

Upgrade the packages and restart runtime.

In \[1\]:

linkcode

```
!pip install --upgrade huggingface_hub transformers datasets

```

```
Requirement already satisfied: huggingface_hub in /opt/conda/lib/python3.10/site-packages (0.16.4)
Requirement already satisfied: transformers in /opt/conda/lib/python3.10/site-packages (4.30.2)
Collecting transformers
  Downloading transformers-4.31.0-py3-none-any.whl (7.4 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 7.4/7.4 MB 57.9 MB/s eta 0:00:00
Requirement already satisfied: datasets in /opt/conda/lib/python3.10/site-packages (2.1.0)
Collecting datasets
  Downloading datasets-2.14.4-py3-none-any.whl (519 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 519.3/519.3 kB 29.6 MB/s eta 0:00:00
Requirement already satisfied: filelock in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (3.12.2)
Requirement already satisfied: fsspec in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (2023.6.0)
Requirement already satisfied: requests in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (2.31.0)
Requirement already satisfied: tqdm>=4.42.1 in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (4.65.0)
Requirement already satisfied: pyyaml>=5.1 in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (6.0)
Requirement already satisfied: typing-extensions>=3.7.4.3 in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (4.6.3)
Requirement already satisfied: packaging>=20.9 in /opt/conda/lib/python3.10/site-packages (from huggingface_hub) (21.3)
Requirement already satisfied: numpy>=1.17 in /opt/conda/lib/python3.10/site-packages (from transformers) (1.23.5)
Requirement already satisfied: regex!=2019.12.17 in /opt/conda/lib/python3.10/site-packages (from transformers) (2023.6.3)
Requirement already satisfied: tokenizers!=0.11.3,<0.14,>=0.11.1 in /opt/conda/lib/python3.10/site-packages (from transformers) (0.13.3)
Requirement already satisfied: safetensors>=0.3.1 in /opt/conda/lib/python3.10/site-packages (from transformers) (0.3.1)
Requirement already satisfied: pyarrow>=8.0.0 in /opt/conda/lib/python3.10/site-packages (from datasets) (9.0.0)
Requirement already satisfied: dill<0.3.8,>=0.3.0 in /opt/conda/lib/python3.10/site-packages (from datasets) (0.3.6)
Requirement already satisfied: pandas in /opt/conda/lib/python3.10/site-packages (from datasets) (1.5.3)
Requirement already satisfied: xxhash in /opt/conda/lib/python3.10/site-packages (from datasets) (3.2.0)
Requirement already satisfied: multiprocess in /opt/conda/lib/python3.10/site-packages (from datasets) (0.70.14)
Requirement already satisfied: aiohttp in /opt/conda/lib/python3.10/site-packages (from datasets) (3.8.4)
Requirement already satisfied: attrs>=17.3.0 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (23.1.0)
Requirement already satisfied: charset-normalizer<4.0,>=2.0 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (3.1.0)
Requirement already satisfied: multidict<7.0,>=4.5 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (6.0.4)
Requirement already satisfied: async-timeout<5.0,>=4.0.0a3 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (4.0.2)
Requirement already satisfied: yarl<2.0,>=1.0 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (1.9.2)
Requirement already satisfied: frozenlist>=1.1.1 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (1.3.3)
Requirement already satisfied: aiosignal>=1.1.2 in /opt/conda/lib/python3.10/site-packages (from aiohttp->datasets) (1.3.1)
Requirement already satisfied: pyparsing!=3.0.5,>=2.0.2 in /opt/conda/lib/python3.10/site-packages (from packaging>=20.9->huggingface_hub) (3.0.9)
Requirement already satisfied: idna<4,>=2.5 in /opt/conda/lib/python3.10/site-packages (from requests->huggingface_hub) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /opt/conda/lib/python3.10/site-packages (from requests->huggingface_hub) (1.26.15)
Requirement already satisfied: certifi>=2017.4.17 in /opt/conda/lib/python3.10/site-packages (from requests->huggingface_hub) (2023.5.7)
Requirement already satisfied: python-dateutil>=2.8.1 in /opt/conda/lib/python3.10/site-packages (from pandas->datasets) (2.8.2)
Requirement already satisfied: pytz>=2020.1 in /opt/conda/lib/python3.10/site-packages (from pandas->datasets) (2023.3)
Requirement already satisfied: six>=1.5 in /opt/conda/lib/python3.10/site-packages (from python-dateutil>=2.8.1->pandas->datasets) (1.16.0)
Installing collected packages: transformers, datasets
  Attempting uninstall: transformers
    Found existing installation: transformers 4.30.2
    Uninstalling transformers-4.30.2:
      Successfully uninstalled transformers-4.30.2
  Attempting uninstall: datasets
    Found existing installation: datasets 2.1.0
    Uninstalling datasets-2.1.0:
      Successfully uninstalled datasets-2.1.0
Successfully installed datasets-2.14.4 transformers-4.31.0

```

linkcode

Load the data in a dataframe

In \[2\]:

linkcode

```
from pathlib import Path
input_dir = Path("/kaggle/input/bbc-full-text-document-classification/bbc/")
categories = [x.name for x in input_dir.iterdir() if x.is_dir()]

X = []
y = []

for category in categories:
    for filepath in (input_dir / category).iterdir():
        if filepath.is_file():
            y.append(category)
            X.append(' '.join(open(filepath, encoding="utf8", errors='ignore').read().replace('\n',' ').split()))

```

In \[3\]:

linkcode

```
import pandas as pd
df = pd.DataFrame(data = {"text": X, "label": y})
df.head()

```

Out\[3\]:

|     | text                                              | label    |
| --- | ------------------------------------------------- | -------- |
| 0   | Budget to set scene for election Gordon Brown ... | politics |
| 1   | Army chiefs in regiments decision Military chi... | politics |
| 2   | Howard denies split over ID cards Michael Howa... | politics |
| 3   | Observers to monitor UK election Ministers wil... | politics |
| 4   | Kilroy names election seat target Ex-chat show... | politics |

In \[4\]:

linkcode

```
df.shape

```

Out\[4\]:

```
(2225, 2)
```

linkcode

Split the data in train-validation-test

In \[5\]:

linkcode

```
from sklearn.model_selection import train_test_split
train_df, test_df = train_test_split(df,
                                          test_size=0.15,
                                          stratify=df["label"],random_state=42)

```

```
/opt/conda/lib/python3.10/site-packages/scipy/__init__.py:146: UserWarning: A NumPy version >=1.16.5 and <1.23.0 is required for this version of SciPy (detected version 1.23.5
  warnings.warn(f"A NumPy version >={np_minversion} and <{np_maxversion}"

```

In \[6\]:

linkcode

```
train_df.reset_index(inplace=True)
test_df.reset_index(inplace=True)

```

In \[7\]:

linkcode

```
train_df.drop(['index'],axis=1,inplace=True)
test_df.drop(['index'],axis=1,inplace=True)

```

In \[8\]:

linkcode

```
train_df, validation_df = train_test_split(train_df,
                                          test_size=0.20,
                                          stratify=train_df["label"],random_state=42)

```

linkcode

Change categorical labels to ordinal encoding

In \[9\]:

linkcode

```
label_to_number = {
    'business': 0,
    'entertainment': 1,
    'politics': 2,
    'sport': 3,
    'tech': 4
}

```

In \[10\]:

linkcode

```
train_df.loc[:,'label'] = [label_to_number[label] for label in train_df['label']]
validation_df.loc[:,'label'] = [label_to_number[label] for label in validation_df['label']]
test_df.loc[:,'label'] = [label_to_number[label] for label in test_df['label']]

```

```
/tmp/ipykernel_20/896896529.py:1: DeprecationWarning: In a future version, `df.iloc[:, i] = newvals` will attempt to set the values inplace instead of always setting a new array. To retain the old behavior, use either `df[df.columns[i]] = newvals` or, if columns are non-unique, `df.isetitem(i, newvals)`
  train_df.loc[:,'label'] = [label_to_number[label] for label in train_df['label']]
/tmp/ipykernel_20/896896529.py:2: DeprecationWarning: In a future version, `df.iloc[:, i] = newvals` will attempt to set the values inplace instead of always setting a new array. To retain the old behavior, use either `df[df.columns[i]] = newvals` or, if columns are non-unique, `df.isetitem(i, newvals)`
  validation_df.loc[:,'label'] = [label_to_number[label] for label in validation_df['label']]
/tmp/ipykernel_20/896896529.py:3: DeprecationWarning: In a future version, `df.iloc[:, i] = newvals` will attempt to set the values inplace instead of always setting a new array. To retain the old behavior, use either `df[df.columns[i]] = newvals` or, if columns are non-unique, `df.isetitem(i, newvals)`
  test_df.loc[:,'label'] = [label_to_number[label] for label in test_df['label']]

```

In \[11\]:

linkcode

```
train_df

```

Out\[11\]:

|      | text                                              | label |
| ---- | ------------------------------------------------- | ----- |
| 1509 | Chinese wine tempts Italy's Illva Italy's Illv... | 0     |
| 45   | Labour chooses Manchester The Labour Party wil... | 2     |
| 64   | Iran budget seeks state sell-offs Iran's presi... | 0     |
| 1596 | Roundabout continues nostalgia trip The new bi... | 1     |
| 680  | US charity anthem is re-released We Are The Wo... | 1     |
| ...  | ...                                               | ...   |
| 755  | Game warnings 'must be clearer' Violent video ... | 2     |
| 451  | Blair ready to call election Tony Blair seems ... | 2     |
| 1231 | Mourinho expects fight to finish Chelsea manag... | 3     |
| 41   | India power shares jump on debut Shares in Ind... | 0     |
| 29   | Critics back Aviator for Oscars Martin Scorses... | 1     |

1512 rows × 2 columns

linkcode

Convert to huggingface dataset

In \[12\]:

linkcode

```
from datasets import load_dataset, Dataset, DatasetDict
train_dataset = Dataset.from_pandas(train_df)
validation_dataset = Dataset.from_pandas(validation_df)
test_dataset = Dataset.from_pandas(test_df)

# Create a dictionary containing all three datasets
datasets = {
    "train": train_dataset,
    "validation": validation_dataset,
    "test": test_dataset
}

# Create a dataset dictionary
custom_dataset = DatasetDict(datasets)

```

In \[13\]:

linkcode

```
custom_dataset

```

Out\[13\]:

```
DatasetDict({
    train: Dataset({
        features: ['text', 'label', '__index_level_0__'],
        num_rows: 1512
    })
    validation: Dataset({
        features: ['text', 'label', '__index_level_0__'],
        num_rows: 379
    })
    test: Dataset({
        features: ['text', 'label'],
        num_rows: 334
    })
})
```

In \[14\]:

linkcode

```
train_dataset = Dataset.from_pandas(train_df).remove_columns(['__index_level_0__'])
validation_dataset = Dataset.from_pandas(validation_df).remove_columns(['__index_level_0__'])
test_dataset = Dataset.from_pandas(test_df)

# Create a dictionary containing all three datasets
datasets = {
    "train": train_dataset,
    "validation": validation_dataset,
    "test": test_dataset
}

# Create a dataset dictionary
custom_dataset = DatasetDict(datasets)

```

In \[15\]:

linkcode

```
custom_dataset

```

Out\[15\]:

```
DatasetDict({
    train: Dataset({
        features: ['text', 'label'],
        num_rows: 1512
    })
    validation: Dataset({
        features: ['text', 'label'],
        num_rows: 379
    })
    test: Dataset({
        features: ['text', 'label'],
        num_rows: 334
    })
})
```

linkcode

Check label distribution

In \[16\]:

linkcode

```
import matplotlib.pyplot as plt
import numpy as np

# Generate example label distribution data (replace this with your data)
labels = custom_dataset['train']['label']

# Calculate label frequencies
label_counts = np.unique(labels, return_counts=True)

# Extract labels and counts
unique_labels = label_counts[0]
label_freqs = label_counts[1]

# Create a bar plot
plt.bar(unique_labels, label_freqs)

# Add labels and title
plt.xlabel('Labels')
plt.ylabel('Frequency')
plt.title('Label Distribution Histogram')

# Show the plot
plt.show()

```

![](https://www.kaggleusercontent.com/kf/140568711/eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..e24lSbvKo1clwLgxfLATOA.LmYR0U_ABq1VVU09S2H5jx9djC7jxu4A1mpkXpiJqm-v6e9d4axLU46BEvuIIuXqr0hjmvUHv-0gS72aAAcdR4wWfzhDdexielVQYTZ25hsB94P1P9N9JZraWu459F8xUrnwVuosRVzAf_6eIh_074-vtD4fvD-ULAUt5cve851GpL8IY6yuL_7RDtWI-UfexbSBZuwojgN5Q2keorqI28atMe6cCnOS4hcoT0E8lVu65fWkj2iW6b6o_quv-207YCn6PBXHDh40VYLxfXuJwQrurS6vWLc5ZHejYQu-gW4cVL0ZcMuqIdoffExjQwbGpJnG96wDIWPVy65J7PyacDyS4DiwwaUXUlkzNpFsjiEHA5M-RJNnc92CTV2mEPO0ZfFam7jhmceXO2HuP6W6bTfeebuNcK33_GdSxPVCFnjQ1RI3UMdYR0R0PJWUwjQe8NuNHEyguYSpQKQZ0XjPIMxqYniYKz4L3nYA5sFZms3Ndp1sO4lOBQWX0ys1dlDcVFpiMds2o92VKqETxAj9rBD4NNCb0wTreg3wP5-w6oHNXa8B9GCY3pmawalZa6SxnuYnVsQbqT8-O4KpCGIAlCnw4nQyeP96uP_KWLtnhOlWRFpHPyjfUugvW5rJ2LfMXWH8vKHstn8UtQgfLwy34w.gkZCKFVRir4z66FuebCNkQ/__results___files/__results___21_0.png)

In \[17\]:

linkcode

```
label_freqs

```

Out\[17\]:

```
array([347, 262, 283, 347, 273])
```

linkcode

Load huggingface api key. The access token should have write functionality.

In \[18\]:

linkcode

```
from kaggle_secrets import UserSecretsClient
user_secrets = UserSecretsClient()
secret_value_0 = user_secrets.get_secret("huggingface-write")

```

In \[19\]:

linkcode

```
from huggingface_hub import login
login(secret_value_0)

```

```
Token will not been saved to git credential helper. Pass `add_to_git_credential=True` if you want to set the git credential as well.
Token is valid (permission: write).
Your token has been saved to /root/.cache/huggingface/token
Login successful

```

linkcode

Push the dataset to hub.

In \[20\]:

linkcode

```
from datasets import Dataset

dataset_name = "KushT/bbc_news_multiclass_train_val_test"  # Replace with your dataset's name

# Create a new dataset in the hub
custom_dataset.push_to_hub(
    dataset_name
)

```

Pushing dataset shards to the dataset hub: 100%

1/1 \[00:00<00:00, 63.51it/s\]

Pushing dataset shards to the dataset hub: 100%

1/1 \[00:00<00:00, 74.83it/s\]

Pushing dataset shards to the dataset hub: 100%

1/1 \[00:00<00:00, 66.73it/s\]

Downloading metadata: 100%

791/791 \[00:00<00:00, 48.2kB/s\]

In \[ \]:

linkcode

```


```

## License

This Notebook has been released under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) open source license.

## Continue exploring

- ![](https://www.kaggle.com/static/images/kernel/viewer/input_light.svg)

Input

1 file

arrow_right_alt

- ![](https://www.kaggle.com/static/images/kernel/viewer/output_light.svg)

Output

0 files

arrow_right_alt

- ![](https://www.kaggle.com/static/images/kernel/viewer/logs_light.svg)

Logs

62.1 second run - successful

arrow_right_alt

- ![](https://www.kaggle.com/static/images/kernel/viewer/comments_light.svg)

Comments

0 comments

arrow_right_alt
