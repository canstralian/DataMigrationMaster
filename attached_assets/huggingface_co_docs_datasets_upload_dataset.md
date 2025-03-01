## URL: https://huggingface.co/docs/datasets/upload_dataset

Datasets documentation

Share a dataset to the Hub

# Datasets

🏡 View all docsAWS Trainium & InferentiaAccelerateAmazon SageMakerArgillaAutoTrainBitsandbytesChat UICompetitionsDataset viewerDatasetsDiffusersDistilabelEvaluateGradioHubHub Python LibraryHugging Face Generative AI Services (HUGS)Huggingface.jsInference API (serverless)Inference Endpoints (dedicated)LeaderboardsLightevalOptimumPEFTSafetensorsSentence TransformersTRLTasksText Embeddings InferenceText Generation InferenceTokenizersTransformersTransformers.jssmolagentstimm

Search documentation
`Ctrl+K`

mainv3.3.2v3.2.0v3.1.0v3.0.2v2.21.0v2.20.0v2.19.0v2.18.0v2.17.1v2.16.1v2.15.0v2.14.7v2.13.2v2.12.0v2.11.0v2.10.0v2.9.0v2.8.0v2.7.1v2.6.2v2.5.2v2.4.0v2.3.2v2.2.1v2.1.0v2.0.0v1.18.3v1.17.0v1.16.1v1.15.1v1.14.0v1.13.3v1.12.1v1.11.0v1.10.2v1.9.0v1.8.0v1.7.0v1.6.2v1.5.0v1.4.1v1.3.0v1.2.1v1.1.3v1.0.2v0.4.0v0.3.0EN

[19,708](https://github.com/huggingface/datasets)

![Hugging Face's logo](https://huggingface.co/front/assets/huggingface_logo-noborder.svg)

Join the Hugging Face community

and get access to the augmented documentation experience

Collaborate on models, datasets and Spaces

Faster examples with accelerated inference

Switch between documentation themes

[Sign Up](https://huggingface.co/join)

to get started

# Share a dataset to the Hub

The [Hub](https://huggingface.co/datasets) is home to an extensive collection of community-curated and popular research datasets. We encourage you to share your dataset to the Hub to help grow the ML community and accelerate progress for everyone. All contributions are welcome; adding a dataset is just a drag and drop away!

Start by [creating a Hugging Face Hub account](https://huggingface.co/join) if you don’t have one yet.

## Upload with the Hub UI

The Hub’s web-based interface allows users without any developer experience to upload a dataset.

### Create a repository

A repository hosts all your dataset files, including the revision history, making storing more than one dataset version possible.

1. Click on your profile and select **New Dataset** to create a new dataset repository.
2. Pick a name for your dataset, and choose whether it is a public or private dataset. A public dataset is visible to anyone, whereas a private dataset can only be viewed by you or members of your organization.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/create_repo.png)

### Upload dataset

1. Once you’ve created a repository, navigate to the **Files and versions** tab to add a file. Select **Add file** to upload your dataset files. We support many text, audio, and image data extensions such as `.csv`, `.mp3`, and `.jpg` among many others. For text data extensions like `.csv`, `.json`, `.jsonl`, and `.txt`, we recommend compressing them before uploading to the Hub (to `.zip` or `.gz` file extension for example).

Text file extensions are not tracked by Git LFS by default, and if they’re greater than 10MB, they will not be committed and uploaded. Take a look at the `.gitattributes` file in your repository for a complete list of tracked file extensions. For this tutorial, you can use the following sample `.csv` files since they’re small: [train.csv](https://huggingface.co/datasets/stevhliu/demo/raw/main/train.csv), [test.csv](https://huggingface.co/datasets/stevhliu/demo/raw/main/test.csv).

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/upload_files.png)

2. Drag and drop your dataset files and add a brief descriptive commit message.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/commit_files.png)

3. After uploading your dataset files, they are stored in your dataset repository.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/files_stored.png)

### Create a Dataset card

Adding a Dataset card is super valuable for helping users find your dataset and understand how to use it responsibly.

1. Click on **Create Dataset Card** to create a Dataset card. This button creates a `README.md` file in your repository.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/dataset_card.png)

2. At the top, you’ll see the **Metadata UI** with several fields to select from like license, language, and task categories. These are the most important tags for helping users discover your dataset on the Hub. When you select an option from each field, they’ll be automatically added to the top of the dataset card.

You can also look at the [Dataset Card specifications](https://github.com/huggingface/hub-docs/blob/main/datasetcard.md?plain=1), which has a complete set of (but not required) tag options like `annotations_creators`, to help you choose the appropriate tags.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/datasets/metadata_ui.png)

3. Click on the **Import dataset card template** link at the top of the editor to automatically create a dataset card template. Filling out the template is a great way to introduce your dataset to the community and help users understand how to use it. For a detailed example of what a good Dataset card should look like, take a look at the [CNN DailyMail Dataset card](https://huggingface.co/datasets/cnn_dailymail).

### Load dataset

Once your dataset is stored on the Hub, anyone can load it with the [load_dataset()](https://huggingface.co/docs/datasets/v3.3.2/en/package_reference/loading_methods#datasets.load_dataset) function:

Copied

```
>>> from datasets import load_dataset

>>> dataset = load_dataset("stevhliu/demo")
```

## Upload with Python

Users who prefer to upload a dataset programmatically can use the [huggingface_hub](https://huggingface.co/docs/huggingface_hub/index) library. This library allows users to interact with the Hub from Python.

1. Begin by installing the library:

Copied

```
pip install huggingface_hub
```

2. To upload a dataset on the Hub in Python, you need to log in to your Hugging Face account:

Copied

```
huggingface-cli login
```

3. Use the [`push_to_hub()`](https://huggingface.co/docs/datasets/main/en/package_reference/main_classes#datasets.DatasetDict.push_to_hub) function to help you add, commit, and push a file to your repository:

Copied

```
>>> from datasets import load_dataset

>>> dataset = load_dataset("stevhliu/demo")
# dataset = dataset.map(...)  # do all your processing here
>>> dataset.push_to_hub("stevhliu/processed_demo")
```

To set your dataset as private, set the `private` parameter to `True`. This parameter will only work if you are creating a repository for the first time.

Copied

```
>>> dataset.push_to_hub("stevhliu/private_processed_demo", private=True)
```

To add a new configuration (or subset) to a dataset or to add a new split (train/validation/test), please refer to the [Dataset.push_to_hub()](https://huggingface.co/docs/datasets/v3.3.2/en/package_reference/main_classes#datasets.Dataset.push_to_hub) documentation.

### Privacy

A private dataset is only accessible by you. Similarly, if you share a dataset within your organization, then members of the organization can also access the dataset.

Load a private dataset by providing your authentication token to the `token` parameter:

Copied

```
>>> from datasets import load_dataset

# Load a private individual dataset
>>> dataset = load_dataset("stevhliu/demo", token=True)

# Load a private organization dataset
>>> dataset = load_dataset("organization/dataset_name", token=True)
```

## What’s next?

Congratulations, you’ve completed the tutorials! 🥳

From here, you can go on to:

- Learn more about how to use 🤗 Datasets other functions to [process your dataset](https://huggingface.co/docs/datasets/process).
- [Stream large datasets](https://huggingface.co/docs/datasets/stream) without downloading it locally.
- [Define your dataset splits and configurations](https://huggingface.co/docs/datasets/repository_structure) and share your dataset with the community.

If you have any questions about 🤗 Datasets, feel free to join and ask the community on our [forum](https://discuss.huggingface.co/c/datasets/10).

[<>Update on GitHub](https://github.com/huggingface/datasets/blob/main/docs/source/upload_dataset.mdx)

[←Create a dataset](https://huggingface.co/docs/datasets/create_dataset) [Overview→](https://huggingface.co/docs/datasets/how_to)
