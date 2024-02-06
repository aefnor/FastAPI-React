# task_generator.py

from tasks import process_node
from celery import group, chain

def create_tasks(adjacency_list, node_types):
    # Create a list to hold the parallel groups
    parallel_groups = []

    for node_id, neighbors in adjacency_list.items():
        node_type = node_types.get(node_id, 'default_type')  # Fetch node type from the provided dictionary or use a default type
        # Create a group for parallel execution of tasks for each node
        parallel_group = group(process_node.s(node_id, node_type) for node_id in [node_id] + neighbors)

        # Append the parallel group to the list
        parallel_groups.append(parallel_group)

    # Chain the parallel groups sequentially
    chained_tasks = chain(*parallel_groups)

    # Apply the chained tasks
    chained_tasks.apply_async()
