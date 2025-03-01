## URL: https://huggingface.co/spaces/librarian-bots/dataset-migrator

Fetching metadata from the HF Docker repository...

Refreshing

Gradio

# Dataset Migration Tool

_✨ Migrate datasets to Hugging Face Hub in a few steps ✨_

While GitHub and Kaggle are great platforms, the Hugging Face Datasets Hub is a better place to host and share datasets.
Some of the benefits of hosting datasets on the Hugging Face Datasets Hub are:

- Hosting for large datasets
- An interactive preview of your dataset
- Access to the dataset via many tools and libraries including; datasets, pandas, polars, dask and DuckDB
- Seamless integration with machine learning workflows
- Version control and dataset versioning

This app will help you migrate datasets currently hosted on GitHub or Kaggle to the Hugging Face Datasets Hub.

Make sure you consider the license of the dataset when migrating it to the Hugging Face Datasets Hub 🤗.

_Note: the Kaggle implementation is experimental and may not work for all datasets. Feel free to open a PR to improve it!_

![Sign in with Hugging Face icon](https://huggingface.co/front/assets/huggingface_logo-noborder.svg) Sign in with Hugging Face

GitHub Kaggle

### Location of existing dataset

URL for the GitHub repository where the dataset is currently hosted

Source GitHub Repository URL

Advanced Options▼

### Select files and folder to migrate

(Optional): select a specific folder and/or files to migrate from the GitHub repository. If you select a folder all the files in that folder will be migrated.

Folder in the GitHub Repository to migrate

Files in GitHub Repository to migrate

### Destination for your migrated dataset

Destination Hugging Face Repository

Migrate GitHub Dataset

### Source Kaggle Dataset

Enter the Kaggle dataset name and file path

Source Kaggle Dataset

File path in dataset
Specify the file to migrate from the dataset

### Destination for your migrated dataset

Destination Hugging Face Repository

Migrate Kaggle Dataset

You should add a dataset card for your dataset to help people discover and understand your dataset. You can find instructions for creating a dataset card [here](https://huggingface.co/docs/datasets/dataset_card).
If you have any questions or feedback feel free to reach out to us on using the [Discussion tab](https://huggingface.co/spaces/librarian-bots/github-to-huggingface-dataset-migration-tool/discussions/1)
